import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity } from './entities/document.entity';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { InvestorsModule } from '../investors/investors.module';
import { FundsModule } from '../funds/funds.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentEntity]),
    InvestorsModule,
    FundsModule,
    CampaignsModule,
    AiModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
