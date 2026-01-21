import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SurplusPackageDocument = SurplusPackage & Document;

@Schema({
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class SurplusPackage {
    @ApiProperty({ example: '603d2f1e...', description: 'Business ObjectId' })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Business', required: true, index: true })
    businessId: MongooseSchema.Types.ObjectId;

    @ApiProperty({ example: '603d2f1e...', description: 'Category ObjectId' })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'SurplusCategory' })
    category: MongooseSchema.Types.ObjectId;

    @ApiProperty({ example: 'https://example.com/img.jpg', description: 'Package image URL' })
    @Prop()
    packageImg: string;

    @ApiProperty({ example: 'Bundle Pack', description: 'Package title' })
    @Prop({ required: true })
    title: string;

    @ApiProperty({ example: 'A great bundle', description: 'Package description' })
    @Prop()
    description: string;

    @ApiProperty({ example: 100, description: 'Original price' })
    @Prop({ type: Number, required: true, min: 0 })
    originalPrice: number;

    @ApiProperty({ example: 80, description: 'Offer price' })
    @Prop({ type: Number, required: true, min: 0 })
    offerPrice: number;

    @ApiProperty({ example: 10, description: 'Quantity available' })
    @Prop({ type: Number, required: true, min: 0 })
    quantityAvailable: number;

    @ApiProperty({ example: 1, description: 'Max per user' })
    @Prop({ type: Number, default: 1 })
    maxPerUser: number;

    @ApiProperty({ example: '2026-01-01T10:00:00.000Z', description: 'Pickup start time' })
    @Prop({ type: Date, required: true })
    pickupStart: Date;

    @ApiProperty({ example: '2026-01-02T18:00:00.000Z', description: 'Pickup end time' })
    @Prop({ type: Date, required: true })
    pickupEnd: Date;

    @ApiProperty({ example: 'Bring ID', description: 'Pickup instructions' })
    @Prop()
    pickupInstructions: string;

    @ApiProperty({ example: false, description: 'Soft deleted flag' })
    @Prop({ default: false })
    isArchived: boolean;

    @ApiProperty({ example: true, description: 'Active flag' })
    @Prop({ default: true })
    isActive: boolean;

    @ApiProperty({ example: '2026-02-01T00:00:00.000Z', description: 'Expiration timestamp' })
    @Prop()
    expiresAt: Date;

    @ApiProperty({ example: 0, description: 'Total orders' })
    @Prop({ type: Number, default: 0 })
    totalOrders: number;

    @ApiProperty({ example: 'userId', description: 'Created by identifier' })
    @Prop()
    createdBy: string;

    @ApiProperty({ example: 'userId', description: 'Updated by identifier' })
    @Prop()
    updatedBy: string;

    // Virtuals (defined on schema below)
    isSoldOut?: boolean;
    discountPercent?: string;
}

export const SurplusPackageSchema = SchemaFactory.createForClass(SurplusPackage);

// Virtuals
SurplusPackageSchema.virtual('isSoldOut').get(function (this: any) {
    return this.quantityAvailable <= 0;
});

SurplusPackageSchema.virtual('discountPercent').get(function (this: any) {
    if (!this.originalPrice || this.originalPrice === 0) return '0';
    return ((this.originalPrice - this.offerPrice) / this.originalPrice * 100).toFixed(0);
});
