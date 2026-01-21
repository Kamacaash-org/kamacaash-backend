import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ _id: false })
export class ReviewResponse {
    @ApiProperty({ example: 'Thanks for the feedback', description: 'Business response comment' })
    @Prop()
    comment: string;

    @ApiProperty({ example: '2026-01-21T12:00:00.000Z', description: 'Response timestamp' })
    @Prop()
    respondedAt: Date;
}
export const ReviewResponseSchema = SchemaFactory.createForClass(ReviewResponse);

@Schema({ timestamps: true, versionKey: false })
export class Review {
    @ApiProperty({ example: '603d2f1e...', description: 'Reviewer User ObjectId' })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
    userId: MongooseSchema.Types.ObjectId;

    @ApiProperty({ example: '603d2f1e...', description: 'Business ObjectId' })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Business', required: true, index: true })
    businessId: MongooseSchema.Types.ObjectId;

    @ApiProperty({ example: 5, description: 'Rating 1-5' })
    @Prop({ type: Number, required: true, min: 1, max: 5 })
    rating: number;

    @ApiProperty({ example: 'Great service', description: 'Review comment' })
    @Prop()
    comment: string;

    @ApiProperty({ example: 0, description: 'Number of likes' })
    @Prop({ type: Number, default: 0 })
    no_of_likes: number;

    @ApiProperty({ example: 0, description: 'Number of dislikes' })
    @Prop({ type: Number, default: 0 })
    no_of_dis_likes: number;

    @ApiProperty({ type: ReviewResponse, description: 'Business response' })
    @Prop({ type: ReviewResponseSchema, default: null })
    response: ReviewResponse | null;

    @ApiProperty({ example: true, description: 'Visibility flag' })
    @Prop({ default: true })
    isVisible: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
