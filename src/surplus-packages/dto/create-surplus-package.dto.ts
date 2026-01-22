import { ApiProperty } from '@nestjs/swagger';

export class CreateSurplusPackageDto {
  @ApiProperty()
  businessId: string;

  @ApiProperty({ required: false })
  category?: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  originalPrice: number;

  @ApiProperty()
  offerPrice: number;

  @ApiProperty()
  quantityAvailable: number;

  @ApiProperty({ required: false })
  maxPerUser?: number;

  @ApiProperty()
  pickupStart: Date;

  @ApiProperty()
  pickupEnd: Date;

  @ApiProperty({ required: false })
  pickupInstructions?: string;

  @ApiProperty({ required: false })
  expiresAt?: Date;

  @ApiProperty({ required: false })
  createdBy?: string;

  @ApiProperty({ required: false })
  updatedBy?: string;

  // Optional id for updates
  @ApiProperty({ required: false })
  _id?: string;
}
