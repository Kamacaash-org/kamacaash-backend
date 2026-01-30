import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class QueryBusinessDto {
    @ApiProperty({ example: 'APPROVED', enum: ['PENDING', 'APPROVED', 'REJECTED'], required: false })
    @IsOptional()
    @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
    status?: string;

    @ApiProperty({ example: true, required: false })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({ example: '603d2f1e...', required: false })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiProperty({ example: 'search term', required: false })
    @IsOptional()
    @IsString()
    search?: string;
}