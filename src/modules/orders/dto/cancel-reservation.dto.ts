import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelReservationDto {
  @ApiProperty({ example: '603d2f1e...' })
  @IsString()
  userId: string;

  @ApiProperty({ example: '603d2f1e...' })
  @IsString()
  orderId: string;
}
