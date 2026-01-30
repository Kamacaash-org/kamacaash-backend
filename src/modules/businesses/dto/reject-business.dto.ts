import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectBusinessDto {
    @ApiProperty({ example: 'Reason for rejection' })
    @IsString()
    rejectionReason: string;
}