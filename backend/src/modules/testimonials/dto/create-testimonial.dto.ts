import { IsString, IsOptional, IsInt, Min, Max, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTestimonialDto {
  @ApiProperty({ example: 'Ahmed Ali' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Egypt' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ example: 'Amazing experience with Quran learning!' })
  @IsString()
  textEn: string;

  @ApiPropertyOptional({ example: ' Ã—»… —«∆⁄… ›Ì  ⁄·„ «·ﬁ—¬‰!' })
  @IsOptional()
  @IsString()
  textAr?: string;

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ example: 'https://youtube.com/watch?v=xxx' })
  @IsOptional()
  @IsString()
  videoUrl?: string;
}
