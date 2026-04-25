import { IsString, IsOptional, IsBoolean, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Locale } from '@prisma/client';

export class CreateBlogPostDto {
  @ApiProperty({ example: 'how-to-memorize-quran' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'How to Memorize Quran' })
  @IsString()
  titleEn: string;

  @ApiPropertyOptional({ example: 'ﬂÌ›  Õ›Ÿ «·ﬁ—¬‰' })
  @IsOptional()
  @IsString()
  titleAr?: string;

  @ApiProperty({ example: '<p>Full content here...</p>' })
  @IsString()
  contentEn: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contentAr?: string;

  @ApiPropertyOptional({ example: 'A short excerpt...' })
  @IsOptional()
  @IsString()
  excerptEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  excerptAr?: string;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ example: ['quran', 'memorization'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: Locale, default: Locale.EN })
  @IsOptional()
  @IsEnum(Locale)
  locale?: Locale;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
