import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { AppUsersService } from '../../app-mobile/app-users.service';

@Controller('admin/app-users')
export class AppUsersController {
    constructor(private readonly service: AppUsersService) { }

    @Post('register')
    async register(@Body('phoneNumber') phoneNumber: string) {
        return this.service.registerUser(phoneNumber);
    }

    @Post('verify')
    async verify(@Body() body: { phoneNumber: string; otp: string }) {
        return this.service.verifyOTP(body.phoneNumber, body.otp);
    }

    @Post('resend')
    async resend(@Body('phoneNumber') phoneNumber: string) {
        return this.service.resendOTP(phoneNumber);
    }

    @Put('profile')
    async updateProfile(@Body() body: { userId: string; fullName: string }) {
        return this.service.updateProfile(body.userId, body.fullName);
    }

    @Get('profile/:id')
    async getProfile(@Param('id') id: string) {
        return this.service.getUserProfileInfo(id);
    }
}
