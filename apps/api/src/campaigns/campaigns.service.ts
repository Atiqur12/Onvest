import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { AuditAction, AuditEntityType, CampaignStatus } from '@onvest/shared';
import { OnboardingCampaign } from './entities/onboarding-campaign.entity';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  UpdateCampaignStatusDto,
} from './dto/create-campaign.dto';
import { FundsService } from '../funds/funds.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(OnboardingCampaign)
    private readonly repo: Repository<OnboardingCampaign>,
    private readonly funds: FundsService,
    private readonly audit: AuditService,
  ) {}

  async listForUser(clerkUserId: string, fundId?: string): Promise<OnboardingCampaign[]> {
    const funds = await this.funds.listForUser(clerkUserId);
    const allowedFundIds = funds.map((f) => f.id);
    if (allowedFundIds.length === 0) return [];

    const where = fundId
      ? { fundId: allowedFundIds.includes(fundId) ? fundId : '_none_' }
      : undefined;

    const qb = this.repo.createQueryBuilder('c').orderBy('c.created_at', 'DESC');
    qb.where('c.fund_id IN (:...allowedFundIds)', { allowedFundIds });
    if (where?.fundId) qb.andWhere('c.fund_id = :fundId', { fundId: where.fundId });
    return qb.getMany();
  }

  async getForUser(clerkUserId: string, id: string): Promise<OnboardingCampaign> {
    const c = await this.repo.findOne({ where: { id }, relations: { fund: true, investors: true } });
    if (!c) throw new NotFoundException(`Campaign ${id} not found`);
    await this.funds.getForUser(clerkUserId, c.fundId);
    return c;
  }

  async create(clerkUserId: string, dto: CreateCampaignDto): Promise<OnboardingCampaign> {
    await this.funds.getForUser(clerkUserId, dto.fundId);
    const c = await this.repo.save(
      this.repo.create({
        fundId: dto.fundId,
        name: dto.name,
        status: CampaignStatus.DRAFT,
        inviteToken: randomUUID(),
        requiredDocuments: dto.requiredDocuments,
      }),
    );
    await this.audit.log({
      entityType: AuditEntityType.CAMPAIGN,
      entityId: c.id,
      action: AuditAction.CREATED,
      performedBy: clerkUserId,
      newValue: { name: c.name, fundId: c.fundId, requiredDocuments: c.requiredDocuments },
    });
    return c;
  }

  async update(
    clerkUserId: string,
    id: string,
    dto: UpdateCampaignDto,
  ): Promise<OnboardingCampaign> {
    const c = await this.getForUser(clerkUserId, id);
    const previous = { name: c.name, requiredDocuments: c.requiredDocuments };
    Object.assign(c, dto);
    const saved = await this.repo.save(c);
    await this.audit.log({
      entityType: AuditEntityType.CAMPAIGN,
      entityId: saved.id,
      action: AuditAction.STATUS_CHANGED,
      performedBy: clerkUserId,
      previousValue: previous,
      newValue: { name: saved.name, requiredDocuments: saved.requiredDocuments },
    });
    return saved;
  }

  async setStatus(
    clerkUserId: string,
    id: string,
    dto: UpdateCampaignStatusDto,
  ): Promise<OnboardingCampaign> {
    const c = await this.getForUser(clerkUserId, id);
    const prev = c.status;
    c.status = dto.status as CampaignStatus;
    const saved = await this.repo.save(c);
    await this.audit.log({
      entityType: AuditEntityType.CAMPAIGN,
      entityId: saved.id,
      action: AuditAction.STATUS_CHANGED,
      performedBy: clerkUserId,
      previousValue: { status: prev },
      newValue: { status: saved.status },
    });
    return saved;
  }

  async getByPublicToken(token: string): Promise<OnboardingCampaign> {
    const c = await this.repo.findOne({
      where: { inviteToken: token },
      relations: { fund: true },
    });
    if (!c) throw new NotFoundException('Invalid invite token');
    if (c.status !== CampaignStatus.ACTIVE) {
      throw new ForbiddenException('Campaign is not accepting new investors');
    }
    return c;
  }

  async findByIdInternal(id: string): Promise<OnboardingCampaign | null> {
    return this.repo.findOne({ where: { id } });
  }
}
