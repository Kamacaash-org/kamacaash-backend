import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
    @ApiPropertyOptional() @IsOptional() @IsString() street?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() postcode?: string;
}

class DayHoursDto {
    @ApiPropertyOptional() @IsOptional() @IsString() open?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() close?: string;
}

class OpeningHoursDto {
    @ApiPropertyOptional({ type: DayHoursDto }) @IsOptional() @ValidateNested() @Type(() => DayHoursDto) mon?: DayHoursDto;
    @ApiPropertyOptional({ type: DayHoursDto }) @IsOptional() @ValidateNested() @Type(() => DayHoursDto) tue?: DayHoursDto;
    @ApiPropertyOptional({ type: DayHoursDto }) @IsOptional() @ValidateNested() @Type(() => DayHoursDto) wed?: DayHoursDto;
    @ApiPropertyOptional({ type: DayHoursDto }) @IsOptional() @ValidateNested() @Type(() => DayHoursDto) thur?: DayHoursDto;
    @ApiPropertyOptional({ type: DayHoursDto }) @IsOptional() @ValidateNested() @Type(() => DayHoursDto) fri?: DayHoursDto;
    @ApiPropertyOptional({ type: DayHoursDto }) @IsOptional() @ValidateNested() @Type(() => DayHoursDto) sat?: DayHoursDto;
    @ApiPropertyOptional({ type: DayHoursDto }) @IsOptional() @ValidateNested() @Type(() => DayHoursDto) sun?: DayHoursDto;
}

export class EditBusinessSettingsDto {
    @ApiPropertyOptional() @IsOptional() @IsString() businessName?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() phoneNumber?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
    @ApiPropertyOptional({ type: AddressDto }) @IsOptional() @ValidateNested() @Type(() => AddressDto) address?: AddressDto;
    @ApiPropertyOptional({ type: OpeningHoursDto }) @IsOptional() @ValidateNested() @Type(() => OpeningHoursDto) openingHours?: OpeningHoursDto;

    // Files will be handled separately via @UploadedFiles()
}
