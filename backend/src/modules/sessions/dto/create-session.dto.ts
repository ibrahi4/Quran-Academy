import { IsString, IsOptional, IsDateString, IsInt, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SessionStatus, Platform } from '@prisma/client';

export class CreateSessionDto {
  @ApiProperty({ example: 'student-uuid' })
  @IsString()
  studentId: string;

  @ApiPropertyOptional({ example: 'booking-uuid' })
  @IsOptional()
  @IsString()
  bookingId?: string;

  @ApiProperty({ example: 'Surah Al-Fatiha Review' })
  @IsString()
  title: string;

  @ApiProperty({ example: '2025-01-20T10:00:00Z' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 60, default: 60 })
  @IsOptional()
  @IsInt()
  @Min(15)
  duration?: number;

  @ApiPropertyOptional({ enum: Platform, default: Platform.ZOOM })
  @IsOptional()
  @IsEnum(Platform)
  platform?: Platform;

  @ApiPropertyOptional({ example: 'https://zoom.us/j/xxx' })
  @IsOptional()
  @IsString()
  meetingLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
