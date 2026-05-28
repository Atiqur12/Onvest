import { Body, Controller, Post } from '@nestjs/common';
import { IsUUID } from 'class-validator';
import { AiService } from './ai.service';
import { ok } from '../common/dto/api-response';

class ClassifyDocumentDto {
  @IsUUID()
  documentId!: string;
}

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('classify-document')
  async classify(@Body() dto: ClassifyDocumentDto) {
    const doc = await this.ai.classifyDocument(dto.documentId);
    return ok(doc, doc ? 'Document classified' : 'AI not configured; skipped');
  }
}
