import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { BusinessesService } from '../businesses/businesses.service';
import { ReviewTopRequestsService } from './review-top-requests.service';
import { CreateTopReviewsRequestDto } from './dto/create-top-reviews-request.dto';
import { RejectTopReviewsRequestDto } from './dto/reject-top-reviews-request.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    private readonly businessService: BusinessesService,
    private readonly reviewTopRequestsService: ReviewTopRequestsService,
  ) { }

  async reviewBusiness(payload: {
    userId: string;
    businessId: string;
    orderId?: string;
    rating: number;
    comment?: string;
  }) {
    const { userId, businessId, rating, comment } = payload;
    if (!businessId || !rating || !userId)
      throw new Error('userId, businessId and rating are required');
    if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');

    const business = await this.businessService.findById(businessId);

    if (!business) throw new Error('Business not found');

    let review = await this.reviewModel.findOne({ userId, businessId }).exec();
    let action = 'updated';
    if (review) {
      review.rating = rating;
      review.comment = comment;
    } else {
      action = 'created';
      review = await this.reviewModel.create({ userId, businessId, rating, comment } as any);
    }

    await review.save();
    return { review: this.normalizeReview(review), action };
  }

  async getBusinessRatingAggregation(businessId: string) {
    return this.reviewModel
      .aggregate([
        { $match: { businessId } },
        {
          $group: {
            _id: null,
            totalRating: { $sum: '$rating' },
            count: { $sum: 1 },
          },
        },
      ])
      .exec();
  }

  async getBusinessReviews(businessId: string | Types.ObjectId) {
    const reviews = await this.reviewModel
      .find({ businessId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return (reviews as any[]).map((r) => this.normalizeReview(r));
  }

  // reviews.service.ts
  async hasUserReviewedBusiness(userId: Types.ObjectId, businessId: Types.ObjectId) {
    return this.reviewModel.exists({ userId, businessId });
  }

  async getReviewedBusinessIdsByUser(userId: string) {
    return this.reviewModel.find({ userId }).distinct('businessId').exec();
  }

  async createTopReviewsRequest(dto: CreateTopReviewsRequestDto, requestedBy: string) {
    return this.reviewTopRequestsService.create(dto, requestedBy);
  }

  async approveTopReviewsRequest(requestId: string, reviewedBy: string) {
    const request = await this.reviewTopRequestsService.approve(requestId, reviewedBy);

    await this.reviewModel.updateMany(
      { businessId: request.businessId },
      { $set: { isFeatured: false, featuredAt: null } },
    );
    await this.reviewModel.updateMany(
      { _id: { $in: request.reviewIds } },
      { $set: { isFeatured: true, featuredAt: new Date() } },
    );

    return request;
  }

  async rejectTopReviewsRequest(
    requestId: string,
    reviewedBy: string,
    dto: RejectTopReviewsRequestDto,
  ) {
    return this.reviewTopRequestsService.reject(requestId, reviewedBy, dto);
  }

  async listPendingTopReviewRequests() {
    return this.reviewTopRequestsService.listPending();
  }

  private normalizeReview(doc: any) {
    const obj = doc?.toObject ? doc.toObject() : doc;
    if (!obj) return obj;
    return {
      ...obj,
      _id: obj._id?.toString?.() || obj._id,
      userId: obj.userId?.toString?.() || obj.userId,
      businessId: obj.businessId?.toString?.() || obj.businessId,
    };
  }
}
