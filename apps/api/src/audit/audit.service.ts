import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditAction, AuditEntityType } from '@onvest/shared';
import { AuditLog } from './entities/audit-log.entity';

export interface AuditPayload {
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  performedBy: string;
  previousValue?: unknown;
  newValue?: unknown;
  ipAddress?: string | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  async log(p: AuditPayload): Promise<void> {
    try {
      await this.repo.save(
        this.repo.create({
          entityType: p.entityType,
          entityId: p.entityId,
          action: p.action,
          performedBy: p.performedBy,
          previousValue: p.previousValue ?? null,
          newValue: p.newValue ?? null,
          ipAddress: p.ipAddress ?? null,
        }),
      );
    } catch (err) {
      this.logger.error(
        `Failed to write audit log for ${p.entityType}/${p.entityId} ${p.action}: ${(err as Error).message}`,
      );
    }
  }

  async forEntity(entityType: AuditEntityType, entityId: string): Promise<AuditLog[]> {
    return this.repo.find({
      where: { entityType, entityId },
      order: { createdAt: 'ASC' },
    });
  }
}
