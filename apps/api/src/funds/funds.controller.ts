import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { FundsService } from './funds.service';
import { CreateFundDto } from './dto/create-fund.dto';
import { UpdateFundDto } from './dto/update-fund.dto';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { ok } from '../common/dto/api-response';

@Controller('funds')
export class FundsController {
  constructor(private readonly service: FundsService) {}

  @Get()
  async list(@CurrentUser() user: AuthUser) {
    return ok(await this.service.listForUser(user.clerkUserId));
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateFundDto) {
    return ok(await this.service.create(user.clerkUserId, dto), 'Fund created');
  }

  @Get(':id')
  async get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.service.getForUser(user.clerkUserId, id));
  }

  @Put(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFundDto,
  ) {
    return ok(await this.service.update(user.clerkUserId, id, dto), 'Fund updated');
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(user.clerkUserId, id);
  }
}
