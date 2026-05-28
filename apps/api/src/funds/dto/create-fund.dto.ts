import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { FundJurisdiction, FundType } from '@onvest/shared';

export class CreateFundDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @IsEnum(FundType)
  type!: FundType;

  @IsEnum(FundJurisdiction)
  jurisdiction!: FundJurisdiction;

  @IsOptional()
  @IsString()
  description?: string;
}
