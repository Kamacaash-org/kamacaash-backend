import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ReviewTopRequestStatus } from '../schemas/review-top-request.schema';

export class ReviewTopRequestStatusParamDto {
  @ApiProperty({ enum: ReviewTopRequestStatus, example: ReviewTopRequestStatus.APPROVED })
  @IsEnum(ReviewTopRequestStatus)
  status: ReviewTopRequestStatus;
}
