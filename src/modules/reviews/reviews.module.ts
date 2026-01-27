import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';;
import { Review, ReviewSchema } from './schemas/review.schema';
import { ReviewsService } from './reviews.service';
import { BusinessesModule } from '../businesses/businesses.module';
@Module({
    imports: [MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]), BusinessesModule],
    providers: [ReviewsService],
    exports: [ReviewsService],
})
export class ReviewsModule { }
