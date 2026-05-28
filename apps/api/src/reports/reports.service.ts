import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { AuditEntityType } from '@onvest/shared';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { Fund } from '../funds/entities/fund.entity';
import { OnboardingCampaign } from '../campaigns/entities/onboarding-campaign.entity';
import { Investor } from '../investors/entities/investor.entity';
import { DocumentEntity } from '../documents/entities/document.entity';
import { FundManagersService } from '../fund-managers/fund-managers.service';

export interface ReportRow {
  timestamp: string;
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  fundName: string;
  campaignName: string;
  investorName: string;
  investorEmail: string;
  documentType: string;
  ipAddress: string;
  previousValue: string;
  newValue: string;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
    @InjectRepository(Fund)
    private readonly fundRepo: Repository<Fund>,
    @InjectRepository(OnboardingCampaign)
    private readonly campaignRepo: Repository<OnboardingCampaign>,
    @InjectRepository(Investor)
    private readonly investorRepo: Repository<Investor>,
    @InjectRepository(DocumentEntity)
    private readonly documentRepo: Repository<DocumentEntity>,
    private readonly fundManagers: FundManagersService,
  ) {}

  async mifidRows(
    clerkUserId: string,
    from?: Date,
    to?: Date,
  ): Promise<ReportRow[]> {
    const fm = await this.fundManagers.getByClerkId(clerkUserId);

    const funds = await this.fundRepo.find({ where: { fundManagerId: fm.id } });
    const fundIds = funds.map((f) => f.id);
    if (fundIds.length === 0) return [];

    const campaigns = await this.campaignRepo.find({ where: { fundId: In(fundIds) } });
    const campaignIds = campaigns.map((c) => c.id);

    const investors =
      campaignIds.length > 0
        ? await this.investorRepo.find({ where: { campaignId: In(campaignIds) } })
        : [];
    const investorIds = investors.map((i) => i.id);

    const documents =
      investorIds.length > 0
        ? await this.documentRepo.find({ where: { investorId: In(investorIds) } })
        : [];
    const documentIds = documents.map((d) => d.id);

    const allInScopeIds = [...fundIds, ...campaignIds, ...investorIds, ...documentIds];
    if (allInScopeIds.length === 0) return [];

    const where: Record<string, unknown> = { entityId: In(allInScopeIds) };
    if (from && to) where.createdAt = Between(from, to);
    else if (from) where.createdAt = Between(from, new Date());

    const rows = await this.auditRepo.find({
      where,
      order: { createdAt: 'ASC' },
    });

    const fundById = new Map(funds.map((f) => [f.id, f]));
    const campaignById = new Map(campaigns.map((c) => [c.id, c]));
    const investorById = new Map(investors.map((i) => [i.id, i]));
    const documentById = new Map(documents.map((d) => [d.id, d]));

    return rows.map((r): ReportRow => {
      let fundName = '';
      let campaignName = '';
      let investorName = '';
      let investorEmail = '';
      let documentType = '';

      const t = r.entityType;
      if (t === AuditEntityType.FUND) {
        const f = fundById.get(r.entityId);
        if (f) fundName = f.name;
      } else if (t === AuditEntityType.CAMPAIGN) {
        const c = campaignById.get(r.entityId);
        if (c) {
          campaignName = c.name;
          const f = fundById.get(c.fundId);
          if (f) fundName = f.name;
        }
      } else if (t === AuditEntityType.INVESTOR) {
        const i = investorById.get(r.entityId);
        if (i) {
          investorName = `${i.firstName} ${i.lastName}`.trim();
          investorEmail = i.email;
          const c = campaignById.get(i.campaignId);
          if (c) {
            campaignName = c.name;
            const f = fundById.get(c.fundId);
            if (f) fundName = f.name;
          }
        }
      } else if (t === AuditEntityType.DOCUMENT) {
        const d = documentById.get(r.entityId);
        if (d) {
          documentType = d.documentType;
          const i = investorById.get(d.investorId);
          if (i) {
            investorName = `${i.firstName} ${i.lastName}`.trim();
            investorEmail = i.email;
            const c = campaignById.get(i.campaignId);
            if (c) {
              campaignName = c.name;
              const f = fundById.get(c.fundId);
              if (f) fundName = f.name;
            }
          }
        }
      }

      return {
        timestamp: r.createdAt.toISOString(),
        entityType: r.entityType,
        entityId: r.entityId,
        action: r.action,
        performedBy: r.performedBy,
        fundName,
        campaignName,
        investorName,
        investorEmail,
        documentType,
        ipAddress: r.ipAddress ?? '',
        previousValue: r.previousValue ? JSON.stringify(r.previousValue) : '',
        newValue: r.newValue ? JSON.stringify(r.newValue) : '',
      };
    });
  }

  toCsv(rows: ReportRow[]): string {
    const headers: Array<keyof ReportRow> = [
      'timestamp',
      'entityType',
      'entityId',
      'action',
      'performedBy',
      'fundName',
      'campaignName',
      'investorName',
      'investorEmail',
      'documentType',
      'ipAddress',
      'previousValue',
      'newValue',
    ];
    const escape = (v: string): string => {
      if (v === '') return '';
      if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
      return v;
    };
    const lines = [headers.join(',')];
    for (const r of rows) {
      lines.push(headers.map((h) => escape(String(r[h] ?? ''))).join(','));
    }
    return lines.join('\r\n') + '\r\n';
  }
}
