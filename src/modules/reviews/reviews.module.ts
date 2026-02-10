import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewSchema } from './schemas/review.schema';
import { ReviewTopRequestSchema } from './schemas/review-top-request.schema';
import { BusinessesModule } from '../businesses/businesses.module';

const reviewModels: any[] = [
  { name: 'Review', schema: ReviewSchema as any },
  { name: 'ReviewTopRequest', schema: ReviewTopRequestSchema as any },
];

const reviewProviders: any[] = [
  require('./reviews.service').ReviewsService,
  require('./review-top-requests.service').ReviewTopRequestsService,
];
const reviewExports: any[] = [...reviewProviders, MongooseModule];

@Module({
  imports: [
    MongooseModule.forFeature(reviewModels as any),
    BusinessesModule,
  ],
  providers: reviewProviders,
  exports: reviewExports,
})
export class ReviewsModule { }
