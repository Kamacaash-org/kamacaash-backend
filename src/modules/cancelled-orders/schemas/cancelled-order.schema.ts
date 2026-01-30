import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type CancelledOrderDocument = CancelledOrder & Document;

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
export class CancelledOrder {
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

  @ApiProperty({ type: PackageSnapshot, description: 'Package snapshot at cancellation time' })
  // @Prop({ type: PackageSnapshotSchema })
  packageSnapshot: PackageSnapshot;

  @ApiProperty({ example: 80, description: 'Amount' })
  @Prop({ type: Number, required: true })
  amount: number;

  @ApiProperty({ example: 1, description: 'Quantity cancelled' })
  @Prop({ type: Number, required: true })
  quantityCancelled: number;

  @ApiProperty({ example: '2026-01-21T12:00:00.000Z', description: 'Cancelled timestamp' })
  @Prop({ type: Date, default: Date.now })
  cancelledAt: Date;

  @ApiProperty({ example: 'Cancelled by user', description: 'Cancellation reason' })
  @Prop({ default: 'Cancelled by user' })
  cancellationReason: string;
}

export const CancelledOrderSchema = new MongooseSchema({
  orderId: { type: String, required: true, index: true },
  userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  businessId: { type: Types.ObjectId, ref: 'Business', required: true, index: true },
  packageId: { type: Types.ObjectId, ref: 'SurplusPackage', required: true, index: true },
  amount: { type: Number, required: true },
  quantityCancelled: { type: Number, required: true },
  cancelledAt: { type: Date, default: Date.now },
  cancellationReason: { type: String, default: 'Cancelled by user' },
}, { timestamps: true, versionKey: false });
