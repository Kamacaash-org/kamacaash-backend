import { Body, Controller, Post, HttpException, HttpStatus } from '@nestjs/common';
import { ReviewsService } from 'src/modules/reviews/reviews.service';
import { ApiResponse } from '../../utils/response.util';
import { MESSAGES } from '../../constants/messages';

@Controller('app/reviews')
export class AppReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @Post('business')
  async reviewBusiness(
    @Body()
    body: {
      userId: string;
      businessId: string;
      orderId?: string;
      rating: number;
      comment?: string;
    },
  ): Promise<ApiResponse<any>> {
    try {
      const result = await this.service.reviewBusiness(body);
      return new ApiResponse(201, result, MESSAGES.REVIEW.CREATE);
    } catch (err: any) {
      throw new HttpException(err.message || 'Error', HttpStatus.BAD_REQUEST);
    }
  }
}
