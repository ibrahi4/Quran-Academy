import {
  IsString, IsEmail, IsOptional, IsEnum, IsDateString,
  IsIn, MaxLength, MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingType, Gender, StudentLevel } from '@prisma/client';

export class CreateBookingDto {
  @ApiProperty({ example: 'Ahmed Hassan' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'ahmed@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString({}, { message: 'Invalid date of birth' })
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: 'self', enum: ['self', 'child', 'family'] })
  @IsOptional()
  @IsIn(['self', 'child', 'family'])
  studentType?: string;

  @ApiPropertyOptional({ example: 'Arabic' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nativeLanguage?: string;

  @ApiPropertyOptional({ enum: StudentLevel })
  @IsOptional()
  @IsEnum(StudentLevel)
  currentLevel?: StudentLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  parentName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  parentPhone?: string;

  @ApiPropertyOptional({ example: 'father', enum: ['father', 'mother', 'guardian', 'sibling', 'other'] })
  @IsOptional()
  @IsIn(['father', 'mother', 'guardian', 'sibling', 'other'])
  parentRelation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  preferredDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serviceSlug?: string;

  @ApiPropertyOptional({ enum: BookingType, default: BookingType.TRIAL })
  @IsOptional()
  @IsEnum(BookingType)
  type?: BookingType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}