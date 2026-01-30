import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
    @ApiProperty({ example: '+252612345678' })
    @IsString()
    phoneNumber: string;

    @ApiProperty({ example: '123456' })
    @IsString()
    otp: string;
}