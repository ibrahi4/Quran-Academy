import {
  IsUUID,
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  IsEnum,
  IsUrl,
  Min,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Platform, SessionStatus } from '@prisma/client';

export class CreateSessionDto {
  @ApiProperty({
    example: 'student-uuid',
  })
  @IsUUID()
  studentId: string;

  @ApiPropertyOptional({
    example: 'teacher-uuid',
  })
  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @ApiPropertyOptional({
    example: 'booking-uuid',
  })
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @ApiProperty({
    example: 'Surah Al-Fatiha Review',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: '2026-05-16T18:00:00.000Z',
  })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({
    example: 60,
    default: 60,
    minimum: 15,
  })
  @IsOptional()
  @IsInt()
  @Min(15)
  duration?: number;

  @ApiPropertyOptional({
    enum: SessionStatus,
    default: SessionStatus.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @ApiPropertyOptional({
    enum: Platform,
    default: Platform.ZOOM,
  })
  @IsOptional()
  @IsEnum(Platform)
  platform?: Platform;

  @ApiPropertyOptional({
    example: 'https://zoom.us/j/123456789',
  })
  @IsOptional()
  @IsUrl()
  meetingLink?: string;

  @ApiPropertyOptional({
    example: 'https://drive.google.com/file/xxx',
  })
  @IsOptional()
  @IsUrl()
  recordingUrl?: string;

  @ApiPropertyOptional({
    example: 'Student needs revision in tajweed',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}