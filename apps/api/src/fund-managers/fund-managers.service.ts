import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FundManager } from './entities/fund-manager.entity';
import { UpdateFundManagerDto } from './dto/update-fund-manager.dto';

@Injectable()
export class FundManagersService {
  constructor(
    @InjectRepository(FundManager)
    private readonly repo: Repository<FundManager>,
  ) {}

  async getByClerkId(clerkUserId: string): Promise<FundManager> {
    const fm = await this.repo.findOne({ where: { clerkUserId } });
    if (!fm) {
      throw new NotFoundException(`No fund manager for Clerk user ${clerkUserId}`);
    }
    return fm;
  }

  async update(clerkUserId: string, dto: UpdateFundManagerDto): Promise<FundManager> {
    const fm = await this.getByClerkId(clerkUserId);
    Object.assign(fm, dto);
    return this.repo.save(fm);
  }
}
