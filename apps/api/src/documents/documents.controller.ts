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
  UploadedFile as UploadedFileDecorator,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { DocumentsService, type UploadedFile } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { Public } from '../auth/public.decorator';
import { ok } from '../common/dto/api-response';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get()
  async listForInvestor(
    @CurrentUser() user: AuthUser,
    @Query('investorId', ParseUUIDPipe) investorId: string,
  ) {
    return ok(await this.service.listForInvestor(user.clerkUserId, investorId));
  }

  @Public()
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Req() req: Request,
    @UploadedFileDecorator() file: UploadedFile,
    @Body() dto: UploadDocumentDto,
  ) {
    const ip = req.ip ?? null;
    const doc = await this.service.uploadPublic(dto, file, ip);
    return ok(
      {
        id: doc.id,
        documentType: doc.documentType,
        status: doc.status,
        originalFileName: doc.originalFileName,
      },
      'Document uploaded; AI processing queued',
    );
  }

  @Get(':id')
  async get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.service.getForUser(user.clerkUserId, id));
  }

  @Get(':id/download-url')
  async downloadUrl(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.service.createDownloadUrl(user.clerkUserId, id));
  }

  @Patch(':id/accept')
  async accept(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.service.accept(user.clerkUserId, id), 'Document accepted');
  }

  @Patch(':id/reject')
  async reject(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.service.reject(user.clerkUserId, id), 'Document rejected');
  }
}
