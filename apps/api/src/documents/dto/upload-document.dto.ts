import { IsEnum, IsString, IsUUID } from 'class-validator';
import { DocumentType } from '@onvest/shared';

export class UploadDocumentDto {
  @IsString()
  inviteToken!: string;

  @IsUUID()
  investorId!: string;

  @IsEnum(DocumentType)
  documentType!: DocumentType;
}
