import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AuditAction,
  AuditEntityType,
  DocumentStatus,
  DocumentType,
} from '@onvest/shared';
import { DocumentEntity } from './entities/document.entity';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { InvestorsService } from '../investors/investors.service';
import { FundsService } from '../funds/funds.service';
import { CampaignsService } from '../campaigns/campaigns.service';
import { AuditService } from '../audit/audit.service';
import { S3Service } from '../storage/s3.service';
import { AiService } from '../ai/ai.service';

export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
]);

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly repo: Repository<DocumentEntity>,
    private readonly investors: InvestorsService,
    private readonly funds: FundsService,
    private readonly campaigns: CampaignsService,
    private readonly audit: AuditService,
    private readonly s3: S3Service,
    private readonly ai: AiService,
  ) {}

  private readonly logger = new Logger(DocumentsService.name);

  async getForUser(clerkUserId: string, id: string): Promise<DocumentEntity> {
    const doc = await this.repo.findOne({ where: { id }, relations: { investor: true } });
    if (!doc) throw new NotFoundException(`Document ${id} not found`);
    if (!doc.investor) throw new NotFoundException('Document has no investor');
    await this.investors.getForUser(clerkUserId, doc.investor.id);
    return doc;
  }

  async listForInvestor(clerkUserId: string, investorId: string): Promise<DocumentEntity[]> {
    await this.investors.getForUser(clerkUserId, investorId);
    return this.repo.find({ where: { investorId }, order: { uploadedAt: 'DESC' } });
  }

  async createDownloadUrl(clerkUserId: string, id: string): Promise<{ url: string; expiresIn: number }> {
    const doc = await this.getForUser(clerkUserId, id);
    if (!this.s3.isConfigured) {
      throw new ServiceUnavailableException('S3 not configured');
    }
    const ttl = 300;
    const url = await this.s3.createDownloadUrl(doc.s3Key, ttl);
    return { url, expiresIn: ttl };
  }

  async uploadPublic(
    dto: UploadDocumentDto,
    file: UploadedFile,
    ipAddress: string | null,
  ): Promise<DocumentEntity> {
    if (!this.s3.isConfigured) {
      throw new ServiceUnavailableException('S3 not configured');
    }

    const campaign = await this.campaigns.getByPublicToken(dto.inviteToken);
    const investor = await this.investors.findInternal(dto.investorId);
    if (!investor || investor.campaignId !== campaign.id) {
      throw new ForbiddenException('Investor does not belong to this invite');
    }

    if (file.size > MAX_FILE_BYTES) {
      throw new BadRequestException('File exceeds 15MB limit');
    }
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
    }

    const uploaded = await this.s3.uploadBuffer(investor.id, file);

    const doc = await this.repo.save(
      this.repo.create({
        investorId: investor.id,
        documentType: dto.documentType as DocumentType,
        originalFileName: file.originalname,
        s3Key: uploaded.s3Key,
        fileSize: uploaded.size,
        mimeType: uploaded.contentType,
        status: DocumentStatus.AI_PROCESSING,
      }),
    );

    await this.audit.log({
      entityType: AuditEntityType.DOCUMENT,
      entityId: doc.id,
      action: AuditAction.DOCUMENT_UPLOADED,
      performedBy: 'investor',
      newValue: {
        investorId: investor.id,
        documentType: doc.documentType,
        originalFileName: doc.originalFileName,
      },
      ipAddress,
    });

    void this.ai
      .classifyDocument(doc.id)
      .catch((err) =>
        this.logger.error(
          `Async AI classification failed for doc ${doc.id}: ${(err as Error).message}`,
        ),
      );

    return doc;
  }

  async accept(clerkUserId: string, id: string): Promise<DocumentEntity> {
    const doc = await this.getForUser(clerkUserId, id);
    const prev = doc.status;
    doc.status = DocumentStatus.ACCEPTED;
    const saved = await this.repo.save(doc);
    await this.audit.log({
      entityType: AuditEntityType.DOCUMENT,
      entityId: saved.id,
      action: AuditAction.DOCUMENT_ACCEPTED,
      performedBy: clerkUserId,
      previousValue: { status: prev },
      newValue: { status: saved.status },
    });
    return saved;
  }

  async reject(clerkUserId: string, id: string): Promise<DocumentEntity> {
    const doc = await this.getForUser(clerkUserId, id);
    const prev = doc.status;
    doc.status = DocumentStatus.REJECTED;
    const saved = await this.repo.save(doc);
    await this.audit.log({
      entityType: AuditEntityType.DOCUMENT,
      entityId: saved.id,
      action: AuditAction.DOCUMENT_REJECTED,
      performedBy: clerkUserId,
      previousValue: { status: prev },
      newValue: { status: saved.status },
    });
    return saved;
  }

  async findInternal(id: string): Promise<DocumentEntity | null> {
    return this.repo.findOne({ where: { id } });
  }
}
