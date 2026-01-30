import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class StaffResponseDto {
  @ApiProperty({ example: '603d2f1e...' })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  _id: string;

  @ApiProperty({ example: 'user@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'username' })
  @Expose()
  username?: string;

  @ApiProperty({ example: '+1' })
  @Expose()
  countryCode: string;

  @ApiProperty({ example: '123456789' })
  @Expose()
  phone: string;

  @ApiProperty({ example: false })
  @Expose()
  isAdminApproved: boolean;

  @ApiProperty({ example: 'John' })
  @Expose()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @Expose()
  lastName: string;

  @ApiProperty({ example: 'MALE', enum: ['MALE', 'FEMALE'] })
  @Expose()
  sex: string;

  @ApiProperty({ example: false })
  @Expose()
  twoFactorEnabled: boolean;

  @ApiProperty({ example: 'STAFF', enum: ['SUPER_ADMIN', 'STAFF', 'BUSINESS_OWNER'] })
  @Expose()
  role: string;

  @ApiProperty({ example: ['MANAGE_USERS'] })
  @Expose()
  permissions: string[];

  @ApiProperty({ example: true })
  @Expose()
  isActive: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  lastLogin?: Date;

  @ApiProperty({ example: 'John Doe' })
  @Expose()
  fullName?: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  updatedAt: Date;
}
