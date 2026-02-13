import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateSurplusPackageDto {
  @ApiProperty()
  @IsString()
  businessId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  originalPrice: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offerPrice: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantityAvailable: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPerUser?: number;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  pickupStart: Date;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  pickupEnd: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pickupInstructions?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isArchived?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  updatedBy?: string;

  // Optional id for updates
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  _id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  packageImg?: any;
}
