import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  UpdateCampaignStatusDto,
} from './dto/create-campaign.dto';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { Public } from '../auth/public.decorator';
import { ok } from '../common/dto/api-response';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly service: CampaignsService) {}

  @Get()
  async list(@CurrentUser() user: AuthUser, @Query('fundId') fundId?: string) {
    return ok(await this.service.listForUser(user.clerkUserId, fundId));
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateCampaignDto) {
    return ok(await this.service.create(user.clerkUserId, dto), 'Campaign created');
  }

  @Get(':id')
  async get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.service.getForUser(user.clerkUserId, id));
  }

  @Put(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return ok(await this.service.update(user.clerkUserId, id, dto), 'Campaign updated');
  }

  @Patch(':id/status')
  async setStatus(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCampaignStatusDto,
  ) {
    return ok(await this.service.setStatus(user.clerkUserId, id, dto), 'Campaign status changed');
  }

  @Public()
  @Get('public/:token')
  async getByToken(@Param('token') token: string) {
    const c = await this.service.getByPublicToken(token);
    return ok({
      id: c.id,
      name: c.name,
      requiredDocuments: c.requiredDocuments,
      fund: {
        id: c.fund.id,
        name: c.fund.name,
        type: c.fund.type,
        jurisdiction: c.fund.jurisdiction,
      },
    });
  }
}
