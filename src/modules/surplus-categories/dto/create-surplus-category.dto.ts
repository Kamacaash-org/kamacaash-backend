import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateSurplusCategoryDto {
  @ApiProperty({ example: 'Electronics' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'electronics' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ example: 'Category description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://example.com/icon.png' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: null })
  @IsOptional()
  @IsString()
  parentCategory?: string | null;

  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiProperty({ example: true })
  @IsOptional()
  isActive?: boolean;
}
