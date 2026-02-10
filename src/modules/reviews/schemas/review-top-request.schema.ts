import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type ReviewTopRequestDocument = ReviewTopRequest & Document;

export enum ReviewTopRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true, versionKey: false })
export class ReviewTopRequest {
  @ApiProperty({ example: '603d2f1e...', description: 'Business ObjectId' })
  @Prop({ type: Types.ObjectId, ref: 'Business', required: true, index: true })
  businessId: Types.ObjectId;

  @ApiProperty({ example: '603d2f1e...', description: 'Requesting staff ObjectId' })
  @Prop({ type: Types.ObjectId, ref: 'Staff', required: true })
  requestedBy: Types.ObjectId;

  @ApiProperty({
    example: ['603d2f1e...', '603d2f2a...', '603d2f3b...'],
    description: 'Review ObjectIds requested for featuring',
  })
  @Prop({ type: [Types.ObjectId], ref: 'Review', required: true })
  reviewIds: Types.ObjectId[];

  @ApiProperty({
    example: ReviewTopRequestStatus.PENDING,
    enum: ReviewTopRequestStatus,
    description: 'Request status',
  })
  @Prop({
    type: String,
    enum: ReviewTopRequestStatus,
    default: ReviewTopRequestStatus.PENDING,
    index: true,
  })
  status: ReviewTopRequestStatus;

  @ApiProperty({ example: '603d2f1e...', description: 'Approving staff ObjectId' })
  @Prop({ type: Types.ObjectId, ref: 'Staff' })
  reviewedBy: Types.ObjectId;

  @ApiProperty({ example: '2026-01-21T12:00:00.000Z', description: 'Reviewed timestamp' })
  @Prop()
  reviewedAt: Date;

  @ApiProperty({ example: 'Not enough reviews', description: 'Rejection reason' })
  @Prop()
  rejectionReason: string;
}

export const ReviewTopRequestSchema = SchemaFactory.createForClass(ReviewTopRequest);
