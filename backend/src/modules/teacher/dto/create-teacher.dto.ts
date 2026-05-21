import { IsString, IsNumber, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  userId: string;

  @IsNumber()
  @IsOptional()
  hourlyRate?: number;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsArray()
  @IsOptional()
  specialties?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
