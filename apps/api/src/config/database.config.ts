import { DataSourceOptions } from 'typeorm';
import { FundManager } from '../fund-managers/entities/fund-manager.entity';
import { Fund } from '../funds/entities/fund.entity';
import { OnboardingCampaign } from '../campaigns/entities/onboarding-campaign.entity';
import { Investor } from '../investors/entities/investor.entity';
import { DocumentEntity } from '../documents/entities/document.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';

export function buildDataSourceOptions(): DataSourceOptions {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }

  return {
    type: 'mysql',
    url,
    entities: [FundManager, Fund, OnboardingCampaign, Investor, DocumentEntity, AuditLog],
    migrations: [__dirname + '/../migrations/*.{ts,js}'],
    migrationsRun: false,
    synchronize: false,
    logging: process.env.NODE_ENV !== 'production' ? ['error', 'warn'] : ['error'],
    charset: 'utf8mb4',
    timezone: 'Z',
  };
}
