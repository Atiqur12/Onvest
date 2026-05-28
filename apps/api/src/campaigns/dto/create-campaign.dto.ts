import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DocumentType } from '@onvest/shared';

export class CreateCampaignDto {
  @IsUUID()
  fundId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(20)
  @IsEnum(DocumentType, { each: true })
  requiredDocuments!: DocumentType[];
}

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(20)
  @IsEnum(DocumentType, { each: true })
  requiredDocuments?: DocumentType[];
}

export class UpdateCampaignStatusDto {
  @IsEnum(['DRAFT', 'ACTIVE', 'CLOSED'])
  status!: 'DRAFT' | 'ACTIVE' | 'CLOSED';
}
