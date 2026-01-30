import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
    @ApiProperty({ example: '603d2f1e...' })
    @IsString()
    userId: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    fullName: string;
}