import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateFundManagerDto {
  @IsOptional()
  @IsString()
  @MaxLength(191)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  companyName?: string;
}
