import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class BusinessResponseDto {
  @ApiProperty({ example: '603d2f1e...' })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  _id: string;

  @ApiProperty({ example: 'Owner Name' })
  @Expose()
  ownerName: string;

  @ApiProperty({ example: 'My Business' })
  @Expose()
  businessName: string;

  @ApiProperty({ example: '603d2f1e...' })
  @Expose()
  category: string;

  @ApiProperty({ example: '603d2f1e...' })
  @Expose()
  @Transform(({ obj }) => {
    if (obj.primaryStaffAccount && typeof obj.primaryStaffAccount === 'object') {
      // Handle Mongoose populated document
      if (obj.primaryStaffAccount._doc) {
        return {
          _id: obj.primaryStaffAccount._id?.toString(),
          email: obj.primaryStaffAccount.email,
          phone: obj.primaryStaffAccount.phone,
          firstName: obj.primaryStaffAccount.firstName,
          lastName: obj.primaryStaffAccount.lastName
        };
      }
      // Handle plain object
      return {
        ...obj.primaryStaffAccount,
        _id: obj.primaryStaffAccount._id?.toString()
      };
    }
    return obj.primaryStaffAccount;
  })
  primaryStaffAccount: any;

  @ApiProperty({ example: '+252' })
  @Expose()
  countryCode: string;

  @ApiProperty({ example: '612345678' })
  @Expose()
  phoneNumber: string;

  @ApiProperty({ example: 'biz@example.com' })
  @Expose()
  email?: string;

  @ApiProperty()
  @Expose()
  description?: string;

  @ApiProperty()
  @Expose()
  logo?: string;

  @ApiProperty()
  @Expose()
  bannerImage?: string;

  @ApiProperty()
  @Expose()
  registrationNumber?: string;

  @ApiProperty()
  @Expose()
  taxId?: string;

  @ApiProperty()
  @Expose()
  licenseDocument?: string;

  @ApiProperty({ example: false })
  @Expose()
  is_admin_approved: boolean;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  rejectionReason?: string;

  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => obj.address)
  address?: any;

  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => obj.openingHours)
  openingHours?: any;


  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => obj.bankAccountDetails)
  bankAccountDetails?: any;

  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => obj.contract)
  contract?: any;

  @ApiProperty({ example: 'en' })
  @Expose()
  defaultLanguage: string;

  @ApiProperty({ example: 'USD' })
  @Expose()
  currency: string;

  @ApiProperty({ example: 'Africa/Mogadishu' })
  @Expose()
  timeZone: string;

  @ApiProperty({ example: true })
  @Expose()
  isActive: boolean;

  @ApiProperty({ example: false })
  @Expose()
  isArchived: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  updatedAt: Date;

  @ApiProperty()
  @Expose()
  agreementData?: any;
}
