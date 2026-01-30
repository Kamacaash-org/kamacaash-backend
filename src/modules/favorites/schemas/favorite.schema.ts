import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type FavoriteDocument = Favorite & Document;

@Schema({ timestamps: true, versionKey: false })
export class Favorite {
  @ApiProperty({ example: '603d2f1e...', description: 'User ObjectId' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @ApiProperty({ example: '603d2f1e...', description: 'Business ObjectId' })
  @Prop({ type: Types.ObjectId, ref: 'Business', required: true, index: true })
  businessId: Types.ObjectId;

  @ApiProperty({
    example: 'manual',
    enum: ['manual', 'recommendation', 'promotion'],
    description: 'How the favorite was added',
  })
  @Prop({ enum: ['manual', 'recommendation', 'promotion'], default: 'manual' })
  source: string;

  @ApiProperty({ example: 'Great selection', description: 'Optional user note', maxLength: 300 })
  @Prop({ maxlength: 300 })
  note: string;

  @ApiProperty({ example: true, description: 'Visibility flag' })
  @Prop({ default: true })
  isVisible: boolean;

  @ApiProperty({ example: false, description: 'Soft removed flag' })
  @Prop({ default: false })
  isRemoved: boolean;

  @ApiProperty({ example: '2026-01-21T12:00:00.000Z', description: 'Removal timestamp' })
  @Prop()
  removedAt: Date;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
FavoriteSchema.index({ userId: 1, businessId: 1 }, { unique: true });
