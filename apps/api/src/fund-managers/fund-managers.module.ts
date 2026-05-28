import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FundManager } from './entities/fund-manager.entity';
import { FundManagersService } from './fund-managers.service';
import { FundManagersController } from './fund-managers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FundManager])],
  controllers: [FundManagersController],
  providers: [FundManagersService],
  exports: [FundManagersService],
})
export class FundManagersModule {}
