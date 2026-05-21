import {
  IsString, IsUUID, IsInt, IsOptional, IsArray, IsEnum,
  IsDateString, IsUrl, ArrayMinSize, Min, Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Platform, RecurringFrequency } from '@prisma/client';

export class CreateRecurringDto {
  @ApiProperty({ example: 'student-uuid' })
  @IsUUID()
  studentId: string;

  @ApiProperty({ example: 'teacher-uuid' })
  @IsUUID()
  teacherId: string;

  @ApiProperty({ example: 'Tajweed Course - Omar' })
  @IsString()
  title: string;

  @ApiProperty({
    example: [0, 4],
    description: '0=Sun, 1=Mon, ..., 6=Sat',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek: number[];

  @ApiProperty({ example: '09:00', description: 'HH:MM 24h format' })
  @IsString()
  time: string;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsInt()
  @Min(15)
  duration?: number;

  @ApiPropertyOptional({ enum: RecurringFrequency, default: 'WEEKLY' })
  @IsOptional()
  @IsEnum(RecurringFrequency)
  frequency?: RecurringFrequency;

  @ApiProperty({ example: '2026-05-20' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-07-20' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ type: [String], example: ['2026-06-15'] })
  @IsOptional()
  @IsArray()
  @IsDateString({}, { each: true })
  skipDates?: string[];

  @ApiPropertyOptional({ enum: Platform, default: 'ZOOM' })
  @IsOptional()
  @IsEnum(Platform)
  platform?: Platform;

  @ApiPropertyOptional({ example: 'https://zoom.us/j/123' })
  @IsOptional()
  @IsUrl()
  meetingLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    default: false,
    description: 'If true, conflicting dates will be skipped. If false, throws error.',
  })
  @IsOptional()
  skipOnConflict?: boolean;
}