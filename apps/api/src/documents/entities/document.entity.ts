import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DocumentStatus, DocumentType } from '@onvest/shared';
import { Investor } from '../../investors/entities/investor.entity';

@Entity({ name: 'documents' })
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'investor_id', type: 'char', length: 36 })
  investorId!: string;

  @Column({ name: 'document_type', type: 'enum', enum: DocumentType })
  documentType!: DocumentType;

  @Column({ name: 'original_file_name', type: 'varchar', length: 512 })
  originalFileName!: string;

  @Column({ name: 's3_key', type: 'varchar', length: 1024 })
  s3Key!: string;

  @Column({ name: 'file_size', type: 'int' })
  fileSize!: number;

  @Column({ name: 'mime_type', type: 'varchar', length: 191 })
  mimeType!: string;

  @Column({ name: 'ai_classification', type: 'varchar', length: 64, nullable: true })
  aiClassification!: string | null;

  @Column({ name: 'ai_confidence', type: 'float', nullable: true })
  aiConfidence!: number | null;

  @Column({ name: 'ai_flags', type: 'json', nullable: true })
  aiFlags!: string[] | null;

  @Column({ name: 'is_expired', type: 'boolean', default: false })
  isExpired!: boolean;

  @Column({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.PENDING })
  status!: DocumentStatus;

  @CreateDateColumn({ name: 'uploaded_at', type: 'timestamp' })
  uploadedAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @ManyToOne(() => Investor, (i) => i.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'investor_id' })
  investor!: Investor;
}
