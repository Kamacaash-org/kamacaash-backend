import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelOrderDto {
  @ApiProperty({ example: '603d2f1e...' })
  @IsString()
  orderId: string;

  @ApiProperty({ example: 'Customer requested cancellation' })
  @IsString()
  cancellationReason: string;
}
