import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteOrderDto {
  @ApiProperty({ example: '603d2f1e...' })
  @IsString()
  orderId: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  pinCode: string;

  @ApiProperty({ example: '603d2f1e...' })
  @IsString()
  completedBy: string;
}
