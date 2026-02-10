import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RejectTopReviewsRequestDto {
  @ApiProperty({ example: 'Not enough reviews', description: 'Reason for rejection' })
  @IsString()
  rejectionReason: string;
}
