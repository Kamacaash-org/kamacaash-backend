import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AppReviewsService {
    constructor(
        @InjectModel('Review') private reviewModel: Model<any>,
        @InjectModel('Business') private businessModel: Model<any>,
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
}
