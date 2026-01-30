import { Body, Controller, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { RegisterUserDto } from '../../modules/users/dto/register-user.dto';
import { VerifyOtpDto } from '../../modules/users/dto/verify-otp.dto';
import { ResendOtpDto } from '../../modules/users/dto/resend-otp.dto';
import { UpdateProfileDto } from '../../modules/users/dto/update-profile.dto';
import { UserResponseDto } from '../../modules/users/dto/user-response.dto';
import { plainToClass } from 'class-transformer';

@Controller('admin/app-users')
export class AppUsersController {
  constructor(private readonly service: UsersService) { }

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@Body() dto: RegisterUserDto) {
    return this.service.registerUser(dto.phoneNumber);
  }

  @Post('verify')
  @UsePipes(new ValidationPipe({ transform: true }))
  async verify(@Body() dto: VerifyOtpDto): Promise<UserResponseDto> {
    const result = await this.service.verifyOTP(dto.phoneNumber, dto.otp);
    return plainToClass(UserResponseDto, result, { excludeExtraneousValues: true });
  }

  @Post('resend')
  @UsePipes(new ValidationPipe({ transform: true }))
  async resend(@Body() dto: ResendOtpDto) {
    return this.service.resendOTP(dto.phoneNumber);
  }

  @Put('profile')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateProfile(@Body() dto: UpdateProfileDto): Promise<UserResponseDto> {
    const result = await this.service.updateProfile(dto.userId, dto.fullName);
    return plainToClass(UserResponseDto, result, { excludeExtraneousValues: true });
  }

  @Get('profile/:id')
  async getProfile(@Param('id') id: string): Promise<UserResponseDto> {
    const result = await this.service.getUserProfileInfo(id);
    return plainToClass(UserResponseDto, result, { excludeExtraneousValues: true });
  }
}
