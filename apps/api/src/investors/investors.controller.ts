import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuditEntityType, InvestorStatus } from '@onvest/shared';
import { InvestorsService } from './investors.service';
import { RejectInvestorDto, SubmitInvestorDto } from './dto/investor.dto';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { Public } from '../auth/public.decorator';
import { ok } from '../common/dto/api-response';
import { AuditService } from '../audit/audit.service';

@Controller('investors')
export class InvestorsController {
  constructor(
    private readonly service: InvestorsService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: AuthUser,
    @Query('status') status?: InvestorStatus,
    @Query('campaignId') campaignId?: string,
  ) {
    return ok(await this.service.listForUser(user.clerkUserId, { status, campaignId }));
  }

  @Public()
  @Post('public')
  async submitPublic(@Req() req: Request, @Body() dto: SubmitInvestorDto) {
    const ip = req.ip ?? null;
    const investor = await this.service.submitPublic(dto, ip);
    return ok(
      { id: investor.id, status: investor.status },
      'Submission received; reviewer will be notified',
    );
  }

  @Get(':id')
  async get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.service.getForUser(user.clerkUserId, id));
  }

  @Patch(':id/approve')
  async approve(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.service.approve(user.clerkUserId, id), 'Investor approved');
  }

  @Patch(':id/reject')
  async reject(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectInvestorDto,
  ) {
    return ok(await this.service.reject(user.clerkUserId, id, dto), 'Investor rejected');
  }

  @Get(':id/audit')
  async auditTrail(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.service.getForUser(user.clerkUserId, id);
    return ok(await this.audit.forEntity(AuditEntityType.INVESTOR, id));
  }
}
