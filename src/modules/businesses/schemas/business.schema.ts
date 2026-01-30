import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type BusinessDocument = Business & Document;

class DayHours {
  @ApiProperty({ example: '09:00', required: false })
  @Prop()
  open: string;

  @ApiProperty({ example: '18:00', required: false })
  @Prop()
  close: string;
}
const DayHoursSchema = SchemaFactory.createForClass(DayHours);

@Schema({ _id: false })
class Address {
  @ApiProperty({ example: 'Street 1' })
  @Prop()
  street: string;

  @ApiProperty({ example: 'Mogadishu' })
  @Prop()
  city: string;

  @ApiProperty({ example: 'Benadir' })
  @Prop()
  state: string;

  @ApiProperty({ example: 'SOMALIA' })
  @Prop({ default: 'SOMALIA' })
  country: string;

  @ApiProperty({ example: '12345' })
  @Prop()
  postcode: string;

  // GeoJSON location
  @ApiProperty({ example: { type: 'Point', coordinates: [45.0, 2.0] } })
  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
  })
  type?: string;

  @Prop({ type: [Number] })
  coordinates?: number[];
}
const AddressSchema = SchemaFactory.createForClass(Address);

@Schema({ _id: false })
class Contract {
  @ApiProperty({ example: false })
  @Prop({ default: false })
  isSigned: boolean;

  @ApiProperty()
  @Prop()
  signedDate: Date;

  @ApiProperty()
  @Prop()
  agreementPdf: string;

  @ApiProperty({ example: 'WEEKLY', enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'] })
  @Prop({ enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'], default: 'WEEKLY' })
  payoutSchedule: string;

  @ApiProperty({ example: 10 })
  @Prop({ type: Number, min: 0, max: 100, default: 10 })
  commissionRate: number;
}
const ContractSchema = SchemaFactory.createForClass(Contract);

@Schema({ _id: false })
class BankAccountDetails {
  @ApiProperty()
  @Prop()
  accountHolderName: string;

  @ApiProperty()
  @Prop()
  sortCode: string;

  @ApiProperty()
  @Prop()
  accountNumber: string;
}
const BankAccountDetailsSchema = SchemaFactory.createForClass(BankAccountDetails);

@Schema({ _id: false })
class OpeningHours {
  @ApiProperty({ type: DayHours })
  @Prop({ type: DayHoursSchema, default: {} })
  mon: DayHours;

  @Prop({ type: DayHoursSchema, default: {} })
  tue: DayHours;

  @Prop({ type: DayHoursSchema, default: {} })
  wed: DayHours;

  @Prop({ type: DayHoursSchema, default: {} })
  thur: DayHours;

  @Prop({ type: DayHoursSchema, default: {} })
  fri: DayHours;

  @Prop({ type: DayHoursSchema, default: {} })
  sat: DayHours;

  @Prop({ type: DayHoursSchema, default: {} })
  sun: DayHours;
}
const OpeningHoursSchema = SchemaFactory.createForClass(OpeningHours);

@Schema({ timestamps: true, versionKey: false })
export class Business {
  @ApiProperty({ example: 'Owner Name' })
  @Prop({ required: true })
  ownerName: string;

  @ApiProperty({ example: 'My Business' })
  @Prop({ required: true, unique: true })
  businessName: string;

  @ApiProperty({ example: '603d2f1e...', description: 'SurplusCategory ObjectId' })
  @Prop({ type: Types.ObjectId, ref: 'SurplusCategory', required: true })
  category: Types.ObjectId;

  @ApiProperty({ example: '603d2f1e...', description: 'Primary Staff ObjectId' })
  @Prop({ type: Types.ObjectId, ref: 'Staff', required: true })
  primaryStaffAccount: Types.ObjectId;

  @ApiProperty({ example: '+252' })
  @Prop({ required: true })
  countryCode: string;

  @ApiProperty({ example: '612345678' })
  @Prop({ required: true })
  phoneNumber: string;

  @ApiProperty({ example: 'biz@example.com' })
  @Prop({ lowercase: true })
  email: string;

  // @ApiProperty({ type: Address })
  // @Prop({ type: AddressSchema })
  // address: Address;

  @ApiProperty()
  @Prop()
  description: string;

  @ApiProperty()
  @Prop()
  logo: string;

  @ApiProperty()
  @Prop()
  bannerImage: string;

  @ApiProperty()
  @Prop()
  registrationNumber: string;

  @ApiProperty()
  @Prop()
  taxId: string;

  @ApiProperty()
  @Prop()
  licenseDocument: string;

  @ApiProperty({ example: false })
  @Prop({ default: false })
  is_admin_approved: boolean;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  @Prop({ enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' })
  status: string;

  @ApiProperty()
  @Prop()
  rejectionReason: string;

  @ApiProperty({ example: 'en' })
  @Prop({ default: 'en' })
  defaultLanguage: string;

  @ApiProperty({ example: 'USD' })
  @Prop({ default: 'USD' })
  currency: string;

  @ApiProperty({ example: 'Africa/Mogadishu' })
  @Prop({ default: 'Africa/Mogadishu' })
  timeZone: string;

  // @ApiProperty({ type: Contract })
  // @Prop({ type: ContractSchema })
  // contract: Contract;
  @ApiProperty()
  @Prop({ type: Object })
  contract: any;

  // @ApiProperty({ type: BankAccountDetails })
  // @Prop({ type: BankAccountDetailsSchema })
  // bankAccountDetails: BankAccountDetails;

  // @ApiProperty({ type: OpeningHours })
  // @Prop({ type: OpeningHoursSchema })
  // openingHours: OpeningHours;

  @ApiProperty({ example: true })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ example: false })
  @Prop({ default: false })
  isArchived: boolean;
}

export const BusinessSchema = new MongooseSchema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  description: String,
  logo: String,
  bannerImage: String,
  licenseDocument: String,
  businessType: { type: String, enum: ['RESTAURANT', 'GROCERY', 'BAKERY', 'OTHER'], required: true },
  phone: String,
  timeZone: { type: String, default: 'Africa/Mogadishu' },
  contract: {
    isSigned: Boolean,
    signedDate: Date,
    agreementPdf: String,
  },
  isActive: { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });
