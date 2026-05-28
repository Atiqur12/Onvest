import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Investor } from './entities/investor.entity';
import { InvestorsService } from './investors.service';
import { InvestorsController } from './investors.controller';
import { FundsModule } from '../funds/funds.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { FundManager } from '../fund-managers/entities/fund-manager.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Investor, FundManager]),
    FundsModule,
    CampaignsModule,
  ],
  controllers: [InvestorsController],
  providers: [InvestorsService],
  exports: [InvestorsService],
})
export class InvestorsModule {}
