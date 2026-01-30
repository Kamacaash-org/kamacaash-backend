import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { Exclude } from 'class-transformer';
import { randomUUID } from 'crypto';
export type UserDocument = User & Document;

@Schema({ timestamps: true, versionKey: false })
export class User {
  // Identity & Contact

  @ApiProperty({
    example: '8104f19c-a2d8-40f7-9a0b-12f4c6a4b80a',
    description: 'The ID of the user',
  })
  @Prop({
    required: true,
    index: { unique: true },
    default: () => randomUUID(),
  })
  userId: string;
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'First name',
  })
  @Prop()
  name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Surname',
  })
  @Prop()
  surname: string;
  @ApiProperty({
    example: '+1234567890',
    description: 'The E.164 phone number of the user',
  })
  @Prop({
    required: true,
    unique: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please use a valid phone number'],
  })
  phoneNumber: string;

  @ApiProperty({
    example: false,
    description: 'Whether the phone number has been verified',
  })
  @Prop({ default: false })
  phoneVerified: boolean;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
  })
  @Prop()
  fullName: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'URL to the profile picture',
  })
  @Prop()
  profilePicture: string;

  // OTP & Security
  @ApiProperty({
    example: '123456',
    description: 'One-time password for verification',
  })
  @Prop()
  @Exclude()
  otp: string;

  @ApiProperty({
    example: '2026-01-21T12:00:00.000Z',
    description: 'OTP expiration timestamp',
  })
  @Prop()
  @Exclude()
  otpExpires: Date;

  @ApiProperty({
    example: 0,
    description: 'Number of failed OTP attempts',
  })
  @Prop({ default: 0 })
  @Exclude()
  failedAttempts: number;

  @ApiProperty({
    example: '2026-01-21T13:00:00.000Z',
    description: 'Timestamp until which the account is locked',
  })
  @Prop()
  @Exclude()
  lockedUntil: Date;

  // Preferences
  @ApiProperty({
    example: 'en',
    description: 'Preferred language code',
  })
  @Prop({ default: 'en' })
  preferredLanguage: string;

  @ApiProperty({
    example: 'USD',
    description: 'Preferred currency code',
  })
  @Prop({ default: 'USD' })
  preferredCurrency: string;

  // Referrals
  @ApiProperty({
    example: 'REF123',
    description: 'Referral code assigned to the user',
  })
  @Prop()
  referralCode: string;

  @ApiProperty({
    example: 'REFINVITER',
    description: 'Referral code of the user who referred this user',
  })
  @Prop()
  referredBy: string;

  // Status
  @ApiProperty({
    example: false,
    description: 'Whether the user is banned',
  })
  @Prop({ default: false })
  isBanned: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
