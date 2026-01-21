import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { nanoid } from 'nanoid';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
class PackageSnapshot {
    @ApiProperty({ example: 'Bundle Pack', description: 'Snapshot title' })
    @Prop()
    title: string;

    @ApiProperty({ example: 2, description: 'Snapshot quantity' })
    @Prop()
    quantity: number;

    @ApiProperty({ example: 100, description: 'Snapshot original price' })
    @Prop()
    originalPrice: number;

    @ApiProperty({ example: 80, description: 'Snapshot offer price' })
    @Prop()
    offerPrice: number;

    @ApiProperty({ example: '2026-01-01T10:00:00.000Z', description: 'Pickup start' })
    @Prop()
    pickupStart: Date;

    @ApiProperty({ example: '2026-01-02T18:00:00.000Z', description: 'Pickup end' })
    @Prop()
    pickupEnd: Date;
}
const PackageSnapshotSchema = SchemaFactory.createForClass(PackageSnapshot);

@Schema({ _id: false })
class Coordinates {
    @ApiProperty({ example: 9.123, description: 'Latitude' })
    @Prop()
    lat: number;

    @ApiProperty({ example: 38.123, description: 'Longitude' })
    @Prop()
    lng: number;
}
const CoordinatesSchema = SchemaFactory.createForClass(Coordinates);

@Schema({ _id: false })
class PickupLocation {
    @ApiProperty({ example: 'Street 1, City', description: 'Address' })
    @Prop()
    address: string;

    @ApiProperty({ type: Coordinates, description: 'Coordinates' })
    @Prop({ type: CoordinatesSchema })
    coordinates: Coordinates;
}
const PickupLocationSchema = SchemaFactory.createForClass(PickupLocation);

@Schema({ timestamps: true, versionKey: false })
export class Order {
    @ApiProperty({ example: 'KAM-ABC123DEF4', description: 'Order identifier' })
    @Prop({
        type: String,
        unique: true,
        required: true,
        default: () => `KAM-${nanoid(10)}`.toUpperCase(),
    })
    orderId: string;

    @ApiProperty({ example: '123456', description: '6-digit pin code' })
    @Prop({
        type: String,
        required: true,
        unique: true,
        default: () => Math.floor(100000 + Math.random() * 900000).toString(),
    })
    pinCode: string;

    @ApiProperty({ example: '603d2f1e...', description: 'User ObjectId' })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
    userId: MongooseSchema.Types.ObjectId;

    @ApiProperty({ example: '+1234567890', description: 'User phone' })
    @Prop()
    userPhone: string;

    @ApiProperty({ example: '603d2f1e...', description: 'Business ObjectId' })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Business', required: true, index: true })
    businessId: MongooseSchema.Types.ObjectId;

    @ApiProperty({ example: '603d2f1e...', description: 'Package ObjectId' })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'SurplusPackage', required: true })
    packageId: MongooseSchema.Types.ObjectId;

    @ApiProperty({ example: '603d2f1e...', description: 'Completed by staff ObjectId' })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'staff' })
    completedBy: MongooseSchema.Types.ObjectId;

    @ApiProperty({ type: PackageSnapshot, description: 'Package snapshot at order time' })
    @Prop({ type: PackageSnapshotSchema })
    packageSnapshot: PackageSnapshot;

    @ApiProperty({ example: 1, description: 'Order quantity' })
    @Prop({ type: Number, required: true, min: 1 })
    quantity: number;

    @ApiProperty({ example: 80, description: 'Total amount' })
    @Prop({ type: Number, required: true })
    amount: number;

    @ApiProperty({ example: 'PROMO10', description: 'Promo code' })
    @Prop()
    promoCode: string;

    @ApiProperty({ example: 10, description: 'Discount amount' })
    @Prop({ type: Number, default: 0 })
    discountAmount: number;

    @ApiProperty({ type: PickupLocation, description: 'Pickup location' })
    @Prop({ type: PickupLocationSchema })
    pickupLocation: PickupLocation;

    @ApiProperty({
        example: 'RESERVED',
        enum: ['RESERVED', 'PAID', 'READY_FOR_PICKUP', 'COMPLETED', 'EXPIRED', 'CANCELLED'],
        description: 'Order status',
    })
    @Prop({
        type: String,
        enum: ['RESERVED', 'PAID', 'READY_FOR_PICKUP', 'COMPLETED', 'EXPIRED', 'CANCELLED'],
        default: 'RESERVED',
    })
    status: string;

    @ApiProperty({
        example: 'PENDING',
        enum: ['PENDING', 'CONFIRMED', 'REFUNDED'],
        description: 'Payment status',
    })
    @Prop({ type: String, enum: ['PENDING', 'CONFIRMED', 'REFUNDED'], default: 'PENDING' })
    paymentStatus: string;

    @ApiProperty({
        example: 'card',
        enum: ['EVC', 'JEEB', 'E_DAHAB', 'mobile', 'card'],
        description: 'Payment method',
    })
    @Prop({ type: String, enum: ['EVC', 'JEEB', 'E_DAHAB', 'mobile', 'card'] })
    paymentMethod: string;

    @ApiProperty({ example: 'pi_123', description: 'Payment intent identifier' })
    @Prop()
    paymentIntentId: string;

    @ApiProperty({ example: '2026-01-21T12:00:00.000Z', description: 'Reserved timestamp' })
    @Prop({ type: Date, default: Date.now })
    reserved_at: Date;

    @ApiProperty({ example: '2026-01-21T12:30:00.000Z', description: 'Paid timestamp' })
    @Prop()
    paidAt: Date;

    @ApiProperty({ example: '2026-01-21T13:00:00.000Z', description: 'Completed timestamp' })
    @Prop()
    completedAt: Date;

    @ApiProperty({ example: '2026-01-21T14:00:00.000Z', description: 'Cancelled timestamp' })
    @Prop()
    cancelledAt: Date;

    @ApiProperty({ example: 'User no-show', description: 'Cancellation reason' })
    @Prop()
    cancellationReason: string;

    @ApiProperty({ example: false, description: 'Has user reviewed' })
    @Prop({ type: Boolean, default: false })
    hasUserReviewed: boolean;

    @ApiProperty({ example: false, description: 'Is archived flag' })
    @Prop({ type: Boolean, default: false })
    isArchived: boolean;

    @ApiProperty({ example: false, description: 'Locked flag' })
    @Prop({ type: Boolean, default: false })
    locked: boolean;

    @ApiProperty({ example: 'USER', description: 'Created by identifier' })
    @Prop()
    createdBy: string;

    @ApiProperty({ example: 'ADMIN', description: 'Updated by identifier' })
    @Prop()
    updatedBy: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
