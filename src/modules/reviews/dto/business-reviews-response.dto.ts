import { ApiProperty } from '@nestjs/swagger';
import { ReviewResponseDto } from './review-response.dto';

export class BusinessReviewsResponseDto {
  @ApiProperty({ example: 3 })
  count: number;

  @ApiProperty({ type: [ReviewResponseDto] })
  reviews: ReviewResponseDto[];
}
