import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({ example: 'OldPass123', description: 'Current password' })
    @IsString()
    currentPassword: string;

    @ApiProperty({ example: 'NewStrongPass123', description: 'New password (min 6 chars)' })
    @IsString()
    @MinLength(6)
    newPassword: string;
}
