import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReserveOrderDto {
    @ApiProperty({ example: '603d2f1e...' })
    @IsString()
    userId: string;

    @ApiProperty({ example: '+252612345678' })
    @IsString()
    userPhone: string;

    @ApiProperty({ example: '603d2f1e...' })
    @IsString()
    packageId: string;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsNumber()
    quantity?: number;
}