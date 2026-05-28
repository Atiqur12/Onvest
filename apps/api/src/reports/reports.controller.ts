import { BadRequestException, Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { ok } from '../common/dto/api-response';

function parseDate(value: string | undefined, field: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestException(`${field} must be an ISO-8601 date`);
  }
  return d;
}

@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('mifid.csv')
  async mifidCsv(
    @CurrentUser() user: AuthUser,
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<void> {
    const rows = await this.reports.mifidRows(
      user.clerkUserId,
      parseDate(from, 'from'),
      parseDate(to, 'to'),
    );
    const csv = this.reports.toCsv(rows);
    const fileName = `onvest-mifid-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(csv);
  }

  @Get('mifid/preview')
  async mifidPreview(
    @CurrentUser() user: AuthUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const rows = await this.reports.mifidRows(
      user.clerkUserId,
      parseDate(from, 'from'),
      parseDate(to, 'to'),
    );
    return ok(
      {
        rowCount: rows.length,
        firstTimestamp: rows[0]?.timestamp ?? null,
        lastTimestamp: rows[rows.length - 1]?.timestamp ?? null,
        sample: rows.slice(0, 5),
      },
      'MiFID II audit preview',
    );
  }
}
