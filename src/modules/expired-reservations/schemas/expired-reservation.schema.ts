import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type ExpiredReservationDocument = ExpiredReservation & Document;
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

@Schema({ timestamps: true, versionKey: false })
export class ExpiredReservation {
  @ApiProperty({ example: 'KAM-ABC123DEF4', description: 'Order identifier' })
  @Prop({ required: true, index: true })
  orderId: string;

  @ApiProperty({ example: '603d2f1e...', description: 'User ObjectId' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @ApiProperty({ example: '603d2f1e...', description: 'Business ObjectId' })
  @Prop({ type: Types.ObjectId, ref: 'Business', required: true, index: true })
  businessId: Types.ObjectId;

  @ApiProperty({ example: '603d2f1e...', description: 'Package ObjectId' })
  @Prop({ type: Types.ObjectId, ref: 'SurplusPackage', required: true, index: true })
  packageId: Types.ObjectId;

  // @ApiProperty({ type: PackageSnapshot, description: 'Package snapshot at reservation time' })
  // @Prop({ type: PackageSnapshotSchema })
  // packageSnapshot: PackageSnapshot;

  @ApiProperty({ example: 80, description: 'Amount' })
  @Prop({ type: Number, required: true, min: 0 })
  amount: number;

  @ApiProperty({ example: '2026-01-21T12:00:00.000Z', description: 'Reserved timestamp' })
  @Prop({ type: Date, required: true })
  reservedAt: Date;

  @ApiProperty({ example: '2026-01-22T12:00:00.000Z', description: 'Expired timestamp' })
  @Prop({ type: Date, default: Date.now })
  expiredAt: Date;

  @ApiProperty({ example: 1, description: 'Quantity reserved' })
  @Prop({ type: Number, required: true, min: 1 })
  quantityReserved: number;

  @ApiProperty({ example: 'Not picked up / expired', description: 'Reason for expiry' })
  @Prop({ default: 'Not picked up / expired' })
  reason: string;

  @ApiProperty({ example: false, description: 'Cancelled by user flag' })
  @Prop({ type: Boolean, default: false })
  cancelledByUser: boolean;

  @ApiProperty({ example: '2026-01-22T12:00:00.000Z', description: 'CancelledAt timestamp' })
  @Prop({ type: Date })
  cancelledAt: Date;
}

export const ExpiredReservationSchema = SchemaFactory.createForClass(ExpiredReservation);
