import { IsString, IsBoolean, IsOptional, IsInt, IsEnum, Min, Max } from 'class-validator';
import { StudentLevel } from '@prisma/client';

export class CreateSessionReportDto {
  @IsString()
  sessionId: string;

  @IsBoolean()
  studentAttended: boolean;

  @IsBoolean()
  teacherAttended: boolean;

  @IsOptional() @IsInt() @Min(0)
  studentLateMins?: number;

  @IsOptional() @IsInt() @Min(0)
  teacherLateMins?: number;

  @IsOptional() @IsString()
  lessonSummary?: string;

  @IsOptional() @IsString()
  teacherNotes?: string;

  @IsOptional() @IsString()
  nextLessonFocus?: string;

  @IsOptional() @IsString()
  privateAdminNote?: string;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  participationScore?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  recitationScore?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  tajweedScore?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  memorizationScore?: number;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  overallScore?: number;

  @IsOptional() @IsString()
  evaluationNotes?: string;

  // Trial assessment
  @IsOptional() @IsBoolean()
  isTrialAssessment?: boolean;

  @IsOptional() @IsEnum(StudentLevel)
  recommendedLevel?: StudentLevel;

  @IsOptional() @IsString()
  recommendedPlanNotes?: string;
}