import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrackEventDto {
  @ApiProperty({ example: 'page_view' })
  @IsString()
  event: string;

  @ApiPropertyOptional({ example: '/en/services' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ example: { serviceSlug: 'quran-memorization' } })
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sessionId?: string;
}
