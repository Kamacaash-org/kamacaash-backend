import { ApiProperty } from '@nestjs/swagger';
import { ReviewTopRequestStatus } from '../schemas/review-top-request.schema';
import { ReviewResponseDto } from './review-response.dto';

export class ReviewTopRequestBusinessDto {
  @ApiProperty({ example: '603d2f1e...' })
  _id: string;

  @ApiProperty({ example: 'My Business' })
  businessName: string;

  @ApiProperty({ example: 'https://example.com/logo.png' })
  logo: string;
}

export class ReviewTopRequestResponseDto {
  @ApiProperty({ example: '603d2f1e...' })
  _id: string;

  @ApiProperty({ example: '603d2f1e...', description: 'Business ObjectId' })
  businessId: string;

  @ApiProperty({ type: ReviewTopRequestBusinessDto })
  business?: ReviewTopRequestBusinessDto;

  @ApiProperty({ example: '603d2f1e...', description: 'Requesting staff ObjectId' })
  requestedBy: string;

  @ApiProperty({ type: [ReviewResponseDto] })
  reviewIds: ReviewResponseDto[];

  @ApiProperty({ enum: ReviewTopRequestStatus })
  status: ReviewTopRequestStatus;

  @ApiProperty({ example: '603d2f1e...', description: 'Approving staff ObjectId' })
  reviewedBy: string;

  @ApiProperty({ example: '2026-01-21T12:00:00.000Z' })
  reviewedAt: Date;

  @ApiProperty({ example: 'Not enough reviews' })
  rejectionReason: string;

  @ApiProperty({ example: '2026-01-21T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-21T12:00:00.000Z' })
  updatedAt: Date;
}
