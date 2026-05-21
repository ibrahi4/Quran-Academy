import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WalletPayoutMethod } from '@prisma/client';

export class AddBonusDto {
  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'Excellent Performance' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'Outstanding work this month' })
  @IsString()
  description: string;
}

export class DeductDto {
  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'Late Arrival' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'Late by 15 mins to Omar session' })
  @IsString()
  description: string;
}

export class RecordPayoutDto {
  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: WalletPayoutMethod, example: 'BANK_TRANSFER' })
  @IsEnum(WalletPayoutMethod)
  payoutMethod: WalletPayoutMethod;

  @ApiPropertyOptional({ example: 'TRX-2026-05-25-0042' })
  @IsOptional()
  @IsString()
  payoutReference?: string;

  @ApiPropertyOptional({ example: 'Monthly salary for May 2026' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2026-05-25' })
  @IsOptional()
  @IsDateString()
  receiptDate?: string;
}