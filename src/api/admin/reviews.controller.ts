import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ReviewsService } from 'src/modules/reviews/reviews.service';
import { ApiResponse } from '../../utils/response.util';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateTopReviewsRequestDto } from 'src/modules/reviews/dto/create-top-reviews-request.dto';
import { RejectTopReviewsRequestDto } from 'src/modules/reviews/dto/reject-top-reviews-request.dto';
import { BusinessesService } from 'src/modules/businesses/businesses.service';
import { MESSAGES } from '../../constants/messages';
import { plainToInstance } from 'class-transformer';
import { ReviewTopRequestResponseDto } from 'src/modules/reviews/dto/review-top-request-response.dto';
import {
  BusinessReviewsParamDto,
  ReviewTopRequestIdParamDto,
} from 'src/modules/reviews/dto/review-params.dto';
import { BusinessReviewsResponseDto } from 'src/modules/reviews/dto/business-reviews-response.dto';
import { ReviewResponseDto } from 'src/modules/reviews/dto/review-response.dto';
import { ReviewTopRequestStatusParamDto } from 'src/modules/reviews/dto/review-status-param.dto';
import { ReviewTopRequestStatus } from 'src/modules/reviews/schemas/review-top-request.schema';

@Controller('admin/reviews')
export class AdminReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly businessesService: BusinessesService,
  ) { }

  @Post('top-requests')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createTopReviewsRequest(
    @Req() req: any,
    @Body() dto: CreateTopReviewsRequestDto,
  ): Promise<ApiResponse<ReviewTopRequestResponseDto>> {
    try {
      if (req.user.role !== 'BUSINESS_OWNER') {
        throw new ForbiddenException('Only business owners can request top reviews');
      }

      const business = await this.businessesService.findByPrimaryStaffAccount(req.user.sub);
      if (!business) throw new HttpException('Business not found', HttpStatus.NOT_FOUND);
      if (dto.businessId !== business._id.toString()) {
        throw new ForbiddenException('Business mismatch for top reviews request');
      }

      const result = await this.reviewsService.createTopReviewsRequest(
        dto,
        req.user.sub,
      );

      const data = plainToInstance(ReviewTopRequestResponseDto, result, {
        excludeExtraneousValues: false,
      });
      return new ApiResponse(201, data, MESSAGES.REVIEW.TOP_REQUEST_CREATE);
    } catch (err: any) {
      throw new HttpException(err.message || 'Error', err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Post('top-requests/:id/approve')
  @UseGuards(JwtAuthGuard)
  async approveTopReviewsRequest(
    @Req() req: any,
    @Param() params: ReviewTopRequestIdParamDto,
  ): Promise<ApiResponse<ReviewTopRequestResponseDto>> {
    try {
      if (req.user.role === 'BUSINESS_OWNER') {
        throw new ForbiddenException('Only admin staff can approve requests');
      }
      const result = await this.reviewsService.approveTopReviewsRequest(params.id, req.user.sub);
      const data = plainToInstance(ReviewTopRequestResponseDto, result, {
        excludeExtraneousValues: false,
      });
      return new ApiResponse(200, data, MESSAGES.REVIEW.TOP_REQUEST_APPROVE);
    } catch (err: any) {
      throw new HttpException(err.message || 'Error', err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Post('top-requests/:id/reject')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async rejectTopReviewsRequest(
    @Req() req: any,
    @Param() params: ReviewTopRequestIdParamDto,
    @Body() body: RejectTopReviewsRequestDto,
  ): Promise<ApiResponse<ReviewTopRequestResponseDto>> {
    try {
      if (req.user.role === 'BUSINESS_OWNER') {
        throw new ForbiddenException('Only admin staff can reject requests');
      }
      const result = await this.reviewsService.rejectTopReviewsRequest(
        params.id,
        req.user.sub,
        body,
      );
      const data = plainToInstance(ReviewTopRequestResponseDto, result, {
        excludeExtraneousValues: false,
      });
      return new ApiResponse(200, data, MESSAGES.REVIEW.TOP_REQUEST_REJECT);
    } catch (err: any) {
      throw new HttpException(err.message || 'Error', err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get('business/:businessId')
  // @UseGuards(JwtAuthGuard)
  async getBusinessReviews(
    @Param() params: BusinessReviewsParamDto,
  ): Promise<ApiResponse<BusinessReviewsResponseDto>> {
    try {
      const reviews = await this.reviewsService.getBusinessReviews(params.businessId);
      const data = {
        count: reviews.length,
        reviews: plainToInstance(ReviewResponseDto, reviews, {
          excludeExtraneousValues: false,
        }),
      };
      return new ApiResponse(200, data, MESSAGES.REVIEW.BUSINESS_REVIEWS);
    } catch (err: any) {
      throw new HttpException(err.message || 'Error', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('top-requests/pending')
  @UseGuards(JwtAuthGuard)
  async listPendingTopReviewRequests(): Promise<ApiResponse<ReviewTopRequestResponseDto[]>> {
    try {
      //    if (req.user.role === 'BUSINESS_OWNER') {
      //   throw new ForbiddenException('Only admin staff can list pending top review requests');
      // }
      const result = await this.reviewsService.listPendingTopReviewRequests();
      const data = plainToInstance(ReviewTopRequestResponseDto, result, {
        excludeExtraneousValues: false,
      });
      return new ApiResponse(200, data, 'Pending top review requests retrieved successfully');
    } catch (err: any) {
      throw new HttpException(err.message || 'Error', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('top-requests/status/:status')
  @UseGuards(JwtAuthGuard)
  async listTopReviewRequestsByStatus(
    @Param() params: ReviewTopRequestStatusParamDto,
  ): Promise<ApiResponse<ReviewTopRequestResponseDto[]>> {
    try {
      const status = params.status as ReviewTopRequestStatus;
      const result = await this.reviewsService.listTopReviewRequestsByStatus(status);
      const data = plainToInstance(ReviewTopRequestResponseDto, result, {
        excludeExtraneousValues: false,
      });
      return new ApiResponse(200, data, 'Top review requests retrieved successfully');
    } catch (err: any) {
      throw new HttpException(err.message || 'Error', HttpStatus.BAD_REQUEST);
    }
  }
}
