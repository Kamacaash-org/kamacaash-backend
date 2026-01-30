import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendOtpDto {
  @ApiProperty({ example: '+252612345678' })
  @IsString()
  phoneNumber: string;
}
