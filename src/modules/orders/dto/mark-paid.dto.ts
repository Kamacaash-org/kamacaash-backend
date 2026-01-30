import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MarkPaidDto {
  @ApiProperty({ example: '603d2f1e...' })
  @IsString()
  orderId: string;

  @ApiPropertyOptional({ example: 'pi_123...' })
  @IsOptional()
  @IsString()
  paymentIntentId?: string;

  @ApiPropertyOptional({ example: 'card' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
