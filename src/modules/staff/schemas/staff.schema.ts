import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcryptjs';

export type StaffDocument = Staff & Document;

@Schema({ timestamps: true, versionKey: false })
export class Staff {
  @ApiProperty({ example: 'user@example.com', description: 'Email address' })
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @ApiProperty({ example: 'username', description: 'Optional username' })
  @Prop()
  username: string;

  @ApiProperty({ example: '+1', description: 'Country calling code, e.g., +1' })
  @Prop({ required: true, match: [/^\+\d{1,4}$/, 'Invalid country code format'] })
  countryCode: string;

  @ApiProperty({ example: '123456789', description: 'Phone number (exactly 9 digits)' })
  @Prop({ required: true, match: [/^\d{9}$/, 'Phone number must be exactly 9 digits'] })
  phone: string;

  @ApiProperty({ example: false, description: 'Admin approval flag' })
  @Prop({ default: false })
  isAdminApproved: boolean;

  @ApiProperty({ example: 'John', description: 'First name' })
  @Prop({ required: true })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @Prop({ required: true })
  lastName: string;

  @ApiProperty({ example: 'strongPassword', description: 'Password (min 6 chars)' })
  @Prop({ required: true, minlength: 6 })
  @Exclude()
  password: string;

  @ApiProperty({ example: '123456', description: 'OTP code' })
  @Prop()
  @Exclude()
  otp: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', description: 'OTP expiration timestamp' })
  @Prop()
  @Exclude()
  otpExpires: Date;

  @ApiProperty({ example: false, description: 'Two-factor enabled' })
  @Prop({ default: false })
  twoFactorEnabled: boolean;

  @ApiProperty({ example: 'SECRET', description: 'Two-factor secret' })
  @Prop()
  @Exclude()
  twoFactorSecret: string;

  @ApiProperty({
    example: 'STAFF',
    enum: ['SUPER_ADMIN', 'STAFF', 'BUSINESS_OWNER'],
    description: 'Role of the staff user',
  })
  @Prop({ required: true, enum: ['SUPER_ADMIN', 'STAFF', 'BUSINESS_OWNER'] })
  role: string;

  @ApiProperty({ example: ['MANAGE_USERS'], description: 'Permissions array' })
  @Prop([String])
  permissions: string[];

  @ApiProperty({ example: true, description: 'Active flag' })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', description: 'Last login timestamp' })
  @Prop()
  lastLogin: Date;

  // virtual fullName will be defined on schema
  fullName?: string;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);

// Virtual: fullName
StaffSchema.virtual('fullName').get(function (this: any) {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving (only if modified)
StaffSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});


// Instance method to validate password
StaffSchema.methods.correctPassword = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};
