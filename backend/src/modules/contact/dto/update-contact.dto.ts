import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ContactStatus } from '@prisma/client';

export class UpdateContactDto {
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @IsOptional()
  @IsString()
  adminNote?: string;
}
