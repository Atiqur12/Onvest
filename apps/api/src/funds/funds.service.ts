import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditAction, AuditEntityType } from '@onvest/shared';
import { Fund } from './entities/fund.entity';
import { CreateFundDto } from './dto/create-fund.dto';
import { UpdateFundDto } from './dto/update-fund.dto';
import { FundManagersService } from '../fund-managers/fund-managers.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class FundsService {
  constructor(
    @InjectRepository(Fund)
    private readonly repo: Repository<Fund>,
    private readonly fundManagers: FundManagersService,
    private readonly audit: AuditService,
  ) {}

  async listForUser(clerkUserId: string): Promise<Fund[]> {
    const fm = await this.fundManagers.getByClerkId(clerkUserId);
    return this.repo.find({ where: { fundManagerId: fm.id }, order: { createdAt: 'DESC' } });
  }

  async getForUser(clerkUserId: string, id: string): Promise<Fund> {
    const fund = await this.repo.findOne({ where: { id } });
    if (!fund) throw new NotFoundException(`Fund ${id} not found`);
    const fm = await this.fundManagers.getByClerkId(clerkUserId);
    if (fund.fundManagerId !== fm.id) throw new ForbiddenException('Not your fund');
    return fund;
  }

  async create(clerkUserId: string, dto: CreateFundDto): Promise<Fund> {
    const fm = await this.fundManagers.getByClerkId(clerkUserId);
    const fund = await this.repo.save(
      this.repo.create({
        fundManagerId: fm.id,
        name: dto.name,
        type: dto.type,
        jurisdiction: dto.jurisdiction,
        description: dto.description ?? null,
      }),
    );
    await this.audit.log({
      entityType: AuditEntityType.FUND,
      entityId: fund.id,
      action: AuditAction.CREATED,
      performedBy: clerkUserId,
      newValue: { name: fund.name, type: fund.type, jurisdiction: fund.jurisdiction },
    });
    return fund;
  }

  async update(clerkUserId: string, id: string, dto: UpdateFundDto): Promise<Fund> {
    const fund = await this.getForUser(clerkUserId, id);
    const previous = { name: fund.name, type: fund.type, jurisdiction: fund.jurisdiction };
    Object.assign(fund, dto);
    const saved = await this.repo.save(fund);
    await this.audit.log({
      entityType: AuditEntityType.FUND,
      entityId: saved.id,
      action: AuditAction.STATUS_CHANGED,
      performedBy: clerkUserId,
      previousValue: previous,
      newValue: { name: saved.name, type: saved.type, jurisdiction: saved.jurisdiction },
    });
    return saved;
  }

  async remove(clerkUserId: string, id: string): Promise<void> {
    const fund = await this.getForUser(clerkUserId, id);
    await this.repo.remove(fund);
  }

  async findInternalById(id: string): Promise<Fund | null> {
    return this.repo.findOne({ where: { id } });
  }
}
