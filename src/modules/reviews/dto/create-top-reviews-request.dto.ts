import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from 'class-validator';

export class CreateTopReviewsRequestDto {
  @ApiProperty({ example: '603d2f1e...', description: 'Business ObjectId' })
  @IsString()
  businessId: string;

  @ApiProperty({
    example: ['603d2f1e...', '603d2f2a...', '603d2f3b...'],
    description: 'Exactly 3 review ObjectIds',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsString({ each: true })
  reviewIds: string[];
}
