import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditAction, AuditEntityType } from '@onvest/shared';

@Entity({ name: 'audit_logs' })
@Index(['entityType', 'entityId'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'entity_type', type: 'enum', enum: AuditEntityType })
  entityType!: AuditEntityType;

  @Column({ name: 'entity_id', type: 'char', length: 36 })
  entityId!: string;

  @Column({ type: 'enum', enum: AuditAction })
  action!: AuditAction;

  @Column({ name: 'performed_by', type: 'varchar', length: 191 })
  performedBy!: string;

  @Column({ name: 'previous_value', type: 'json', nullable: true })
  previousValue!: unknown | null;

  @Column({ name: 'new_value', type: 'json', nullable: true })
  newValue!: unknown | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true })
  ipAddress!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}
