import { ApiProperty } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty({ example: '603d2f1e...' })
  _id: string;

  @ApiProperty({ example: '603d2f1e...', description: 'Reviewer User ObjectId' })
  userId: string;

  @ApiProperty({ example: '603d2f1e...', description: 'Business ObjectId' })
  businessId: string;

  @ApiProperty({ example: 5 })
  rating: number;

  @ApiProperty({ example: 'Great service' })
  comment: string;

  @ApiProperty({ example: 0 })
  no_of_likes: number;

  @ApiProperty({ example: 0 })
  no_of_dis_likes: number;

  @ApiProperty({ example: true })
  isVisible: boolean;

  @ApiProperty({ example: false })
  isFeatured: boolean;

  @ApiProperty({ example: '2026-01-21T12:00:00.000Z' })
  featuredAt: Date;

  @ApiProperty({ example: '2026-01-21T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-21T12:00:00.000Z' })
  updatedAt: Date;
}
