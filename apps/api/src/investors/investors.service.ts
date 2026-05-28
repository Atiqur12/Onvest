import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  AuditAction,
  AuditEntityType,
  CampaignStatus,
  InvestorStatus,
} from '@onvest/shared';
import { Investor } from './entities/investor.entity';
import { RejectInvestorDto, SubmitInvestorDto } from './dto/investor.dto';
import { FundsService } from '../funds/funds.service';
import { CampaignsService } from '../campaigns/campaigns.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { FundManager } from '../fund-managers/entities/fund-manager.entity';

@Injectable()
export class InvestorsService {
  constructor(
    @InjectRepository(Investor)
    private readonly repo: Repository<Investor>,
    private readonly funds: FundsService,
    private readonly campaigns: CampaignsService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
    @InjectRepository(FundManager)
    private readonly fundManagers: Repository<FundManager>,
  ) {}

  async listForUser(
    clerkUserId: string,
    filters: { status?: InvestorStatus; campaignId?: string } = {},
  ): Promise<Investor[]> {
    const ownedFunds = await this.funds.listForUser(clerkUserId);
    const fundIds = ownedFunds.map((f) => f.id);
    if (fundIds.length === 0) return [];

    const qb = this.repo
      .createQueryBuilder('i')
      .innerJoin('i.campaign', 'c')
      .where('c.fund_id IN (:...fundIds)', { fundIds })
      .orderBy('i.created_at', 'DESC');

    if (filters.campaignId) {
      qb.andWhere('i.campaign_id = :campaignId', { campaignId: filters.campaignId });
    }
    if (filters.status) {
      qb.andWhere('i.status = :status', { status: filters.status });
    }
    return qb.getMany();
  }

  async getForUser(clerkUserId: string, id: string): Promise<Investor> {
    const investor = await this.repo.findOne({
      where: { id },
      relations: { documents: true, campaign: true },
    });
    if (!investor) throw new NotFoundException(`Investor ${id} not found`);
    const campaign = investor.campaign;
    if (!campaign) throw new NotFoundException('Campaign missing for investor');
    await this.funds.getForUser(clerkUserId, campaign.fundId);
    return investor;
  }

  async submitPublic(dto: SubmitInvestorDto, ipAddress: string | null): Promise<Investor> {
    const campaign = await this.campaigns.getByPublicToken(dto.inviteToken);
    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new ForbiddenException('Campaign not accepting new investors');
    }
    const investor = await this.repo.save(
      this.repo.create({
        campaignId: campaign.id,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        nationality: dto.nationality,
        investorType: dto.investorType,
        entityName: dto.entityName ?? null,
        uboDetails: dto.uboDetails ?? null,
        status: InvestorStatus.SUBMITTED,
        submittedAt: new Date(),
      }),
    );
    await this.audit.log({
      entityType: AuditEntityType.INVESTOR,
      entityId: investor.id,
      action: AuditAction.SUBMITTED,
      performedBy: 'investor',
      newValue: {
        campaignId: campaign.id,
        email: investor.email,
        investorType: investor.investorType,
      },
      ipAddress,
    });

    void (async () => {
      const fund = await this.funds.findInternalById(campaign.fundId);
      if (!fund) return;
      const fm = await this.fundManagers.findOne({ where: { id: fund.fundManagerId } });
      if (!fm) return;
      await this.notifications.notifyInvestorSubmitted({
        investor,
        fundManagerEmail: fm.email,
        campaignName: campaign.name,
      });
    })().catch(() => undefined);

    return investor;
  }

  async approve(clerkUserId: string, id: string): Promise<Investor> {
    const investor = await this.getForUser(clerkUserId, id);
    const prev = investor.status;
    investor.status = InvestorStatus.APPROVED;
    investor.reviewedAt = new Date();
    investor.rejectionReason = null;
    const saved = await this.repo.save(investor);
    await this.audit.log({
      entityType: AuditEntityType.INVESTOR,
      entityId: saved.id,
      action: AuditAction.APPROVED,
      performedBy: clerkUserId,
      previousValue: { status: prev },
      newValue: { status: saved.status },
    });
    void this.notifications.notifyInvestorApproved(saved).catch(() => undefined);
    return saved;
  }

  async reject(clerkUserId: string, id: string, dto: RejectInvestorDto): Promise<Investor> {
    const investor = await this.getForUser(clerkUserId, id);
    const prev = investor.status;
    investor.status = InvestorStatus.REJECTED;
    investor.reviewedAt = new Date();
    investor.rejectionReason = dto.reason;
    const saved = await this.repo.save(investor);
    await this.audit.log({
      entityType: AuditEntityType.INVESTOR,
      entityId: saved.id,
      action: AuditAction.REJECTED,
      performedBy: clerkUserId,
      previousValue: { status: prev },
      newValue: { status: saved.status, rejectionReason: dto.reason },
    });
    void this.notifications.notifyInvestorRejected(saved).catch(() => undefined);
    return saved;
  }

  async findInternal(id: string): Promise<Investor | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findManyInternal(ids: string[]): Promise<Investor[]> {
    if (ids.length === 0) return [];
    return this.repo.find({ where: { id: In(ids) } });
  }
}
