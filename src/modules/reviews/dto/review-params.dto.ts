import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ReviewTopRequestIdParamDto {
  @ApiProperty({ example: '603d2f1e...' })
  @IsString()
  id: string;
}

export class BusinessReviewsParamDto {
  @ApiProperty({ example: '603d2f1e...' })
  @IsString()
  businessId: string;
}
