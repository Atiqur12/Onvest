import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDataSourceOptions } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { ClerkAuthGuard } from './auth/clerk.guard';
import { AuditModule } from './audit/audit.module';
import { StorageModule } from './storage/storage.module';
import { FundManagersModule } from './fund-managers/fund-managers.module';
import { FundsModule } from './funds/funds.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { InvestorsModule } from './investors/investors.module';
import { DocumentsModule } from './documents/documents.module';
import { AiModule } from './ai/ai.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => buildDataSourceOptions(),
    }),
    AuditModule,
    StorageModule,
    NotificationsModule,
    AuthModule,
    FundManagersModule,
    FundsModule,
    CampaignsModule,
    InvestorsModule,
    DocumentsModule,
    AiModule,
    ReportsModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ClerkAuthGuard },
  ],
})
export class AppModule {}
