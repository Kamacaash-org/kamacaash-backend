import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusinessesService } from '../businesses/businesses.service';
import {
  ReviewTopRequest,
  ReviewTopRequestDocument,
  ReviewTopRequestStatus,
} from './schemas/review-top-request.schema';
import { CreateTopReviewsRequestDto } from './dto/create-top-reviews-request.dto';
import { RejectTopReviewsRequestDto } from './dto/reject-top-reviews-request.dto';
import { Review, ReviewDocument } from './schemas/review.schema';

@Injectable()
export class ReviewTopRequestsService {
  constructor(
    @InjectModel(ReviewTopRequest.name)
    private reviewTopRequestModel: Model<ReviewTopRequestDocument>,
    @InjectModel(Review.name)
    private reviewModel: Model<ReviewDocument>,
    private readonly businessService: BusinessesService,
  ) { }

  async create(dto: CreateTopReviewsRequestDto, requestedBy: string) {
    const { businessId, reviewIds } = dto;

    // if (!businessId || !reviewIds || reviewIds.length !== 3) {
    if (!businessId || !reviewIds) {
      throw new BadRequestException('businessId and exactly 3 reviewIds are required');
    }

    const business = await this.businessService.findById(businessId);
    if (!business) throw new NotFoundException('Business not found');

    const reviewsCount = await this.reviewModel.countDocuments({
      _id: { $in: reviewIds },
      businessId: businessId,
    });
    // if (reviewsCount !== 3) {
    //   throw new BadRequestException('All reviewIds must belong to the business');
    // }

    const created = await this.reviewTopRequestModel.create({
      businessId,
      reviewIds,
      requestedBy,
      status: ReviewTopRequestStatus.PENDING,
    });

    return this.normalize(created);
  }

  async approve(requestId: string, reviewedBy: string) {
    const request = await this.reviewTopRequestModel.findById(requestId).exec();
    if (!request) throw new NotFoundException('Review request not found');
    if (request.status !== ReviewTopRequestStatus.PENDING)
      throw new BadRequestException('Request already processed');

    const reviewsCount = await this.reviewModel.countDocuments({
      _id: { $in: request.reviewIds },
      businessId: request.businessId,
    });
    if (reviewsCount !== 3) {
      throw new BadRequestException('Requested reviews are invalid for this business');
    }

    request.status = ReviewTopRequestStatus.APPROVED;
    request.reviewedBy = reviewedBy as any;
    request.reviewedAt = new Date();
    request.rejectionReason = null;
    await request.save();

    return this.normalize(request);
  }

  async reject(requestId: string, reviewedBy: string, dto: RejectTopReviewsRequestDto) {
    if (!dto?.rejectionReason) throw new BadRequestException('Rejection reason is required');

    const request = await this.reviewTopRequestModel.findById(requestId).exec();
    if (!request) throw new NotFoundException('Review request not found');
    if (request.status !== ReviewTopRequestStatus.PENDING)
      throw new BadRequestException('Request already processed');

    request.status = ReviewTopRequestStatus.REJECTED;
    request.reviewedBy = reviewedBy as any;
    request.reviewedAt = new Date();
    request.rejectionReason = dto.rejectionReason;
    await request.save();

    return this.normalize(request);
  }

  private normalize(doc: any) {
    const obj = doc?.toObject ? doc.toObject() : doc;
    if (!obj) return obj;
    return {
      ...obj,
      _id: obj._id?.toString?.() || obj._id,
      businessId: obj.businessId?.toString?.() || obj.businessId,
      requestedBy: obj.requestedBy?.toString?.() || obj.requestedBy,
      reviewIds: Array.isArray(obj.reviewIds)
        ? obj.reviewIds.map((id: any) => id?.toString?.() || id)
        : obj.reviewIds,
      reviewedBy: obj.reviewedBy?.toString?.() || obj.reviewedBy,
    };
  }
}
