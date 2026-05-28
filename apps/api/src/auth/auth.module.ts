import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClerkService } from './clerk.service';
import { ClerkAuthGuard } from './clerk.guard';
import { ClerkWebhookController } from './webhook.controller';
import { FundManager } from '../fund-managers/entities/fund-manager.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FundManager])],
  controllers: [ClerkWebhookController],
  providers: [ClerkService, ClerkAuthGuard],
  exports: [ClerkService, ClerkAuthGuard],
})
export class AuthModule {}
