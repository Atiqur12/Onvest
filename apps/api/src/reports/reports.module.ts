import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { Fund } from '../funds/entities/fund.entity';
import { OnboardingCampaign } from '../campaigns/entities/onboarding-campaign.entity';
import { Investor } from '../investors/entities/investor.entity';
import { DocumentEntity } from '../documents/entities/document.entity';
import { FundManagersModule } from '../fund-managers/fund-managers.module';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog, Fund, OnboardingCampaign, Investor, DocumentEntity]),
    FundManagersModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
