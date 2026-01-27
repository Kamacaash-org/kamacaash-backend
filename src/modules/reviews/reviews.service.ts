import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Business, BusinessDocument } from '../businesses/schemas/business.schema';

@Injectable()
export class ReviewsService {
    constructor(

        @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
        @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,

    ) { }

    async reviewBusiness(payload: { userId: string; businessId: string; orderId?: string; rating: number; comment?: string }) {
        const { userId, businessId, rating, comment } = payload;
        if (!businessId || !rating || !userId) throw new Error('userId, businessId and rating are required');
        if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');

        const business = await this.businessModel.findById(businessId).exec();
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
        return { review, action };
    }




    // reviews.service.ts
    async hasUserReviewedBusiness(
        userId: Types.ObjectId,
        businessId: Types.ObjectId,
    ) {
        return this.reviewModel.exists({ userId, businessId });
    }

}
