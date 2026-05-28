import { Injectable, Logger } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

export interface UploadResult {
  s3Key: string;
  size: number;
  contentType: string;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private _client: S3Client | null = null;

  private get bucket(): string {
    const b = process.env.AWS_S3_BUCKET;
    if (!b) throw new Error('AWS_S3_BUCKET is not configured');
    return b;
  }

  private get client(): S3Client {
    if (this._client) return this._client;
    const region = process.env.AWS_REGION ?? 'eu-west-1';
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS_ACCESS_KEY_ID/SECRET_ACCESS_KEY not configured');
    }
    this._client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
    return this._client;
  }

  get isConfigured(): boolean {
    return Boolean(
      process.env.AWS_S3_BUCKET &&
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY,
    );
  }

  async uploadBuffer(
    investorId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string },
  ): Promise<UploadResult> {
    const ext = file.originalname.includes('.')
      ? file.originalname.slice(file.originalname.lastIndexOf('.'))
      : '';
    const s3Key = `investors/${investorId}/${randomUUID()}${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ServerSideEncryption: 'AES256',
      }),
    );

    return { s3Key, size: file.buffer.length, contentType: file.mimetype };
  }

  async createDownloadUrl(s3Key: string, ttlSeconds = 300): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: s3Key }),
      { expiresIn: ttlSeconds },
    );
  }

  async deleteObject(s3Key: string): Promise<void> {
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: s3Key }));
    } catch (err) {
      this.logger.warn(`Failed to delete s3://${this.bucket}/${s3Key}: ${(err as Error).message}`);
    }
  }

  warnIfMissing(): void {
    if (!this.isConfigured) {
      this.logger.warn(
        'AWS S3 credentials not set — document upload/download routes will return 503',
      );
    }
  }
}
