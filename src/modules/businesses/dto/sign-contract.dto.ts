import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignContractDto {
    @ApiProperty({ example: '603d2f1e...' })
    @IsString()
    _id: string;
}