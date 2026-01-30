import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({ example: '8104f19c-a2d8-40f7-9a0b-12f4c6a4b80a' })
  @Expose()
  userId: string;

  @ApiProperty({ example: 'user@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'John' })
  @Expose()
  name?: string;

  @ApiProperty({ example: 'Doe' })
  @Expose()
  surname?: string;

  @ApiProperty({ example: '+1234567890' })
  @Expose()
  phoneNumber: string;

  @ApiProperty({ example: false })
  @Expose()
  phoneVerified: boolean;

  @ApiProperty({ example: 'John Doe' })
  @Expose()
  fullName?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  @Expose()
  profilePicture?: string;

  @ApiProperty({ example: 'en' })
  @Expose()
  preferredLanguage: string;

  @ApiProperty({ example: 'USD' })
  @Expose()
  preferredCurrency: string;

  @ApiProperty({ example: 'REF123' })
  @Expose()
  referralCode?: string;

  @ApiProperty({ example: 'REFINVITER' })
  @Expose()
  referredBy?: string;

  @ApiProperty({ example: false })
  @Expose()
  isBanned: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  updatedAt: Date;
}
