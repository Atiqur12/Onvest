import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { InvestorType } from '@onvest/shared';

export class UboDetailDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  fullName!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  ownershipPercent!: number;

  @IsString()
  @MaxLength(64)
  nationality!: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;
}

export class SubmitInvestorDto {
  @IsString()
  inviteToken!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(191)
  firstName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(191)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MaxLength(64)
  nationality!: string;

  @IsEnum(InvestorType)
  investorType!: InvestorType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  entityName?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => UboDetailDto)
  uboDetails?: UboDetailDto[];
}

export class RejectInvestorDto {
  @IsString()
  @MinLength(1)
  reason!: string;
}
