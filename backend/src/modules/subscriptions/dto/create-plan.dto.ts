import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlanDto {
  @ApiProperty({ example: 'premium' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'Premium Plan' })
  @IsString()
  nameEn: string;

  @ApiPropertyOptional({ example: '«·Œÿ… «·„„Ì“…' })
  @IsOptional()
  @IsString()
  nameAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @Min(0)
  priceMonthly: number;

  @ApiPropertyOptional({ example: 999.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceYearly?: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  sessionsPerWeek: number;

  @ApiPropertyOptional({ example: 60, default: 60 })
  @IsOptional()
  @IsInt()
  @Min(15)
  sessionDuration?: number;

  @ApiPropertyOptional({ example: ['1-on-1 sessions', 'Progress tracking'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
