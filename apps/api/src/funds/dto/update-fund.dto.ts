import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { FundJurisdiction, FundType } from '@onvest/shared';

export class UpdateFundDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEnum(FundType)
  type?: FundType;

  @IsOptional()
  @IsEnum(FundJurisdiction)
  jurisdiction?: FundJurisdiction;

  @IsOptional()
  @IsString()
  description?: string;
}
