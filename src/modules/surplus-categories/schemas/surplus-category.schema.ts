import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type SurplusCategoryDocument = SurplusCategory & Document;

@Schema({ timestamps: true, versionKey: false })
export class SurplusCategory {
  @ApiProperty({ example: 'Electronics', description: 'Category name' })
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @ApiProperty({ example: 'electronics', description: 'URL-friendly slug' })
  @Prop({ unique: true, lowercase: true, trim: true })
  slug: string;

  @ApiProperty({ example: 'Surplus electronic items', description: 'Description' })
  @Prop()
  description: string;

  @ApiProperty({ example: 'https://example.com/icon.png', description: 'Icon URL' })
  @Prop()
  icon: string;

  @ApiProperty({ example: null, description: 'Parent category id (if any)' })
  @Prop({ type: Types.ObjectId, ref: 'SurplusCategory', default: null })
  parentCategory: Types.ObjectId | null;

  @ApiProperty({ example: true, description: 'Whether category is active' })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ example: 0, description: 'Sort order' })
  @Prop({ default: 0 })
  sortOrder: number;
}

export const SurplusCategorySchema = SchemaFactory.createForClass(SurplusCategory);
