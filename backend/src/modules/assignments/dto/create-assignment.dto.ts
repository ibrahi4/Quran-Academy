import { IsString, IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  title: string;

  @IsString()
  instructions: string;

  @IsString()
  studentId: string;

  @IsOptional() @IsString()
  reportId?: string;

  @IsOptional() @IsString()
  sessionId?: string;

  @IsOptional() @IsDateString()
  dueDate?: string;

  @IsOptional() @IsInt() @Min(1) @Max(100)
  maxScore?: number;
}

export class ReviewSubmissionDto {
  @IsOptional() @IsInt() @Min(0) @Max(100)
  score?: number;

  @IsOptional() @IsString()
  feedback?: string;

  @IsOptional()
  revisionRequested?: boolean;
}