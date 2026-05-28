import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingCampaign } from './entities/onboarding-campaign.entity';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { FundsModule } from '../funds/funds.module';

@Module({
  imports: [TypeOrmModule.forFeature([OnboardingCampaign]), FundsModule],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
