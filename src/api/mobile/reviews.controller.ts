import { Body, Controller, Get, Param, Post, HttpException, HttpStatus } from '@nestjs/common';
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

  @Get('business/:businessId')
  async getBusinessReviews(
    @Param('businessId') businessId: string,
  ): Promise<ApiResponse<any>> {
    try {
      const reviews = await this.service.getBusinessReviews(businessId);
      const data = { count: reviews.length, reviews };
      return new ApiResponse(200, data, 'Business reviews retrieved successfully');
    } catch (err: any) {
      throw new HttpException(err.message || 'Error', HttpStatus.BAD_REQUEST);
    }
  }
}
