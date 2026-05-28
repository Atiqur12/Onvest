import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fund } from './entities/fund.entity';
import { FundsService } from './funds.service';
import { FundsController } from './funds.controller';
import { FundManagersModule } from '../fund-managers/fund-managers.module';

@Module({
  imports: [TypeOrmModule.forFeature([Fund]), FundManagersModule],
  controllers: [FundsController],
  providers: [FundsService],
  exports: [FundsService],
})
export class FundsModule {}
