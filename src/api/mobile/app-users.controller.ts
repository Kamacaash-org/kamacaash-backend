import { Body, Controller, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { RegisterUserDto } from '../../modules/users/dto/register-user.dto';
import { VerifyOtpDto } from '../../modules/users/dto/verify-otp.dto';
import { ResendOtpDto } from '../../modules/users/dto/resend-otp.dto';
import { UpdateProfileDto } from '../../modules/users/dto/update-profile.dto';
import { UserResponseDto } from '../../modules/users/dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { ApiResponse } from '../../utils/response.util';
import { MESSAGES } from '../../constants/messages';

@Controller('app/app-users')
export class AppUsersController {
  constructor(private readonly service: UsersService) { }

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@Body() dto: RegisterUserDto): Promise<ApiResponse<any>> {
    await this.service.registerUser(dto.phoneNumber);
    return new ApiResponse(201, null, MESSAGES.USER.REGISTER);
  }

  @Post('verify')
  @UsePipes(new ValidationPipe({ transform: true }))
  async verify(@Body() dto: VerifyOtpDto): Promise<ApiResponse<UserResponseDto>> {
    const result = await this.service.verifyOTP(dto.phoneNumber, dto.otp);
    const data = plainToInstance(UserResponseDto, result, { excludeExtraneousValues: true });
    return new ApiResponse(200, data, MESSAGES.USER.VERIFY_OTP);
  }

  @Post('resend')
  @UsePipes(new ValidationPipe({ transform: true }))
  async resend(@Body() dto: ResendOtpDto): Promise<ApiResponse<any>> {
    await this.service.resendOTP(dto.phoneNumber);
    return new ApiResponse(200, null, MESSAGES.USER.RESEND_OTP);
  }

  @Put('profile')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateProfile(@Body() dto: UpdateProfileDto): Promise<ApiResponse<UserResponseDto>> {
    const result = await this.service.updateProfile(dto.userId, dto.fullName);
    const data = plainToInstance(UserResponseDto, result, { excludeExtraneousValues: true });
    return new ApiResponse(200, data, MESSAGES.USER.UPDATE_PROFILE);
  }

  @Get('profile/:id')
  async getProfile(@Param('id') id: string): Promise<ApiResponse<UserResponseDto>> {
    const result = await this.service.getUserProfileInfo(id);
    const data = plainToInstance(UserResponseDto, result, { excludeExtraneousValues: true });
    return new ApiResponse(200, data, MESSAGES.USER.GET_PROFILE);
  }
}
