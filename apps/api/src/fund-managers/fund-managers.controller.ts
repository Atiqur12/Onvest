import { Body, Controller, Get, Put } from '@nestjs/common';
import { FundManagersService } from './fund-managers.service';
import { UpdateFundManagerDto } from './dto/update-fund-manager.dto';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { ok } from '../common/dto/api-response';

@Controller('fund-managers')
export class FundManagersController {
  constructor(private readonly service: FundManagersService) {}

  @Get('me')
  async me(@CurrentUser() user: AuthUser) {
    const data = await this.service.getByClerkId(user.clerkUserId);
    return ok(data);
  }

  @Put('me')
  async update(@CurrentUser() user: AuthUser, @Body() dto: UpdateFundManagerDto) {
    const data = await this.service.update(user.clerkUserId, dto);
    return ok(data, 'Fund manager updated');
  }
}
