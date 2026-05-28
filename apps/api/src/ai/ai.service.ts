import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Anthropic from '@anthropic-ai/sdk';
import {
  AuditAction,
  AuditEntityType,
  DocumentStatus,
  DocumentType,
} from '@onvest/shared';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { DocumentEntity } from '../documents/entities/document.entity';
import { S3Service } from '../storage/s3.service';
import { AuditService } from '../audit/audit.service';

interface AiClassification {
  detected_type: DocumentType;
  confidence: number;
  is_expired: boolean;
  expiry_date: string | null;
  flags: string[];
  summary: string;
}

const SYSTEM_PROMPT = `You are a KYC compliance assistant for a European fund management platform.
Analyze the uploaded document and return a JSON object describing it.

Use these rules:
- detected_type must be one of: PASSPORT, NATIONAL_ID, PROOF_OF_ADDRESS, BANK_STATEMENT, COMPANY_REGISTRATION, UBO_DECLARATION, OTHER.
- confidence is a number from 0 to 1 reflecting how confident you are in the classification.
- is_expired is true only if you can clearly see an expiry date that is before today.
- expiry_date is an ISO date (YYYY-MM-DD) if visible, otherwise null.
- flags is an array of any of: document_blurry, document_incomplete, document_expired, wrong_document_type, low_quality, text_not_readable. Empty array if none.
- summary is one short sentence describing the document.
Never invent data that is not visible in the document.`;

const RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    detected_type: {
      type: 'string',
      enum: [
        'PASSPORT',
        'NATIONAL_ID',
        'PROOF_OF_ADDRESS',
        'BANK_STATEMENT',
        'COMPANY_REGISTRATION',
        'UBO_DECLARATION',
        'OTHER',
      ],
    },
    confidence: { type: 'number' },
    is_expired: { type: 'boolean' },
    expiry_date: { type: ['string', 'null'] },
    flags: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: ['detected_type', 'confidence', 'is_expired', 'expiry_date', 'flags', 'summary'],
} as const;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private _client: Anthropic | null = null;

  constructor(
    @InjectRepository(DocumentEntity)
    private readonly docs: Repository<DocumentEntity>,
    private readonly s3: S3Service,
    private readonly audit: AuditService,
  ) {}

  get isConfigured(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  }

  warnIfMissing(): void {
    if (!this.isConfigured) {
      this.logger.warn(
        'ANTHROPIC_API_KEY not set — document classification will be skipped',
      );
    }
  }

  private get client(): Anthropic {
    if (this._client) return this._client;
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured');
    this._client = new Anthropic({ apiKey });
    return this._client;
  }

  private get model(): string {
    return process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-7';
  }

  async classifyDocument(documentId: string): Promise<DocumentEntity | null> {
    const doc = await this.docs.findOne({ where: { id: documentId } });
    if (!doc) throw new NotFoundException(`Document ${documentId} not found`);

    if (!this.isConfigured) {
      this.logger.warn(`Skipping classification for ${documentId} — Anthropic not configured`);
      return null;
    }
    if (!this.s3.isConfigured) {
      throw new ServiceUnavailableException('S3 not configured');
    }

    const fileBytes = await this.downloadFromS3(doc.s3Key);
    const base64 = fileBytes.toString('base64');

    const userContent = [
      this.buildSourceBlock(doc.mimeType, base64),
      {
        type: 'text' as const,
        text: 'Classify the attached document and return the JSON object described in the system prompt.',
      },
    ];

    let response: Anthropic.Message;
    try {
      response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }],
      } as unknown as Anthropic.MessageCreateParamsNonStreaming);
    } catch (err) {
      this.logger.error(
        `Claude classification failed for ${documentId}: ${(err as Error).message}`,
      );
      throw err;
    }

    const result = this.extractJson(response);
    return this.persistResult(doc, result);
  }

  private buildSourceBlock(mimeType: string, base64: string): Record<string, unknown> {
    if (mimeType === 'application/pdf') {
      return {
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: base64 },
      };
    }
    const supportedImage = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!supportedImage.includes(mimeType)) {
      throw new ServiceUnavailableException(
        `Mime type ${mimeType} not supported for AI classification`,
      );
    }
    return {
      type: 'image',
      source: { type: 'base64', media_type: mimeType, data: base64 },
    };
  }

  private extractJson(response: Anthropic.Message): AiClassification {
    for (const block of response.content) {
      if (block.type === 'text') {
        try {
          return JSON.parse(block.text) as AiClassification;
        } catch (err) {
          throw new Error(
            `Failed to parse Claude JSON response: ${(err as Error).message}; raw: ${block.text.slice(0, 200)}`,
          );
        }
      }
    }
    throw new Error('No text block in Claude response');
  }

  private async persistResult(
    doc: DocumentEntity,
    result: AiClassification,
  ): Promise<DocumentEntity> {
    doc.aiClassification = result.detected_type;
    doc.aiConfidence = result.confidence;
    doc.aiFlags = result.flags;
    doc.isExpired = result.is_expired;
    doc.status = DocumentStatus.PENDING;
    const saved = await this.docs.save(doc);
    await this.audit.log({
      entityType: AuditEntityType.DOCUMENT,
      entityId: saved.id,
      action: AuditAction.AI_PROCESSED,
      performedBy: 'ai_system',
      newValue: {
        aiClassification: saved.aiClassification,
        aiConfidence: saved.aiConfidence,
        aiFlags: saved.aiFlags,
        isExpired: saved.isExpired,
        summary: result.summary,
      },
    });
    return saved;
  }

  private async downloadFromS3(s3Key: string): Promise<Buffer> {
    const region = process.env.AWS_REGION ?? 'eu-west-1';
    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket) throw new Error('AWS_S3_BUCKET is not configured');

    const client = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
      },
    });
    const out = await client.send(new GetObjectCommand({ Bucket: bucket, Key: s3Key }));
    if (!out.Body) throw new Error('S3 returned empty body');
    const stream = out.Body as NodeJS.ReadableStream;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
      } else if (typeof chunk === 'string') {
        chunks.push(Buffer.from(chunk));
      } else {
        chunks.push(Buffer.from(chunk as unknown as Uint8Array));
      }
    }
    return Buffer.concat(chunks);
  }
}

