import { IsString, IsOptional, IsEmail, IsBoolean, IsObject, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrUpdateBusinessDto {
  @ApiProperty({ example: '603d2f1e...', required: false })
  @IsOptional()
  @IsString()
  _id?: string;

  @ApiProperty({ example: 'Owner Name' })
  @IsString()
  ownerName: string;

  @ApiProperty({ example: 'My Business' })
  @IsString()
  businessName: string;

  @ApiProperty({ example: '603d2f1e...', description: 'SurplusCategory ObjectId' })
  @IsMongoId()
  category: string;

  @ApiProperty({ example: '603d2f1e...', description: 'Primary Staff ObjectId' })
  @IsMongoId()
  primaryStaffAccount: string;

  @ApiProperty({ example: '+252' })
  @IsString()
  countryCode: string;

  @ApiProperty({ example: '612345678' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: 'biz@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bannerImage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  licenseDocument?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  address?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  openingHours?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  bankAccountDetails?: any;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
