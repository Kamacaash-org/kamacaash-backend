import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Order } from '../orders/schemas/order.schema';
import { generateOTP, sendOTP } from '../utils/otpHelpers';

const LOCKOUT_DURATION = 60 * 60 * 1000; // 1 hour
const MAX_FAILED_ATTEMPTS = 3;

@Injectable()
export class AppUsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Order.name) private orderModel: Model<any>,
    ) { }

    async registerUser(phoneNumber: string) {
        if (!phoneNumber) throw new BadRequestException('Phone number is required');

        const lockedUser = await this.userModel.findOne({ phoneNumber, lockedUntil: { $gt: Date.now() } });
        if (lockedUser) {
            const remainingTime = Math.ceil((lockedUser.lockedUntil.getTime() - Date.now()) / 60000);
            throw new BadRequestException(`Account is locked. Please try again in ${remainingTime} minutes`);
        }

        let user = await this.userModel.findOne({ phoneNumber }).exec();

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 60 * 1000);

        if (!user) {
            // Fill required fields to satisfy existing schema
            const emailFallback = `${phoneNumber.replace(/[^0-9]/g, '')}@mobile.local`;
            const randomPassword = Math.random().toString(36).slice(2);
            // Use Model.create to avoid deep type instantiation from 'new this.userModel(...)'
            user = await this.userModel.create({
                phoneNumber,
                email: emailFallback,
                password: randomPassword,
                otp,
                otpExpires,
                failedAttempts: 0,
                lockedUntil: null,
            } as any);
        } else {
            user.otp = otp;
            user.otpExpires = otpExpires;
            if (user.lockedUntil && user.lockedUntil <= new Date()) {
                user.failedAttempts = 0;
                user.lockedUntil = null as any;
            }
        }

        await user.save();
        await sendOTP(phoneNumber, otp);

        return { phoneNumber: user.phoneNumber, message: 'OTP sent successfully' };
    }

    async verifyOTP(phoneNumber: string, otp: string) {
        const user = await this.userModel.findOne({ phoneNumber }).exec();
        if (!user) throw new NotFoundException('User not found');

        // Basic verification without lock/attempts for now (can be extended)
        if (!user.otp || user.otp !== otp || !user.otpExpires || user.otpExpires.getTime() < Date.now()) {
            // Increment failed attempts and possibly lock
            user.failedAttempts = (user.failedAttempts || 0) + 1;
            if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
                user.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
            }
            await user.save();
            throw new BadRequestException('Invalid or expired OTP');
        }

        user.phoneVerified = true;
        user.otp = undefined as any;
        user.otpExpires = undefined as any;
        user.failedAttempts = 0;
        user.lockedUntil = null as any;
        await user.save();

        return {
            userId: user._id,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            profilePicture: user.profilePicture,
            phoneVerified: user.phoneVerified,
        };
    }

    async resendOTP(phoneNumber: string) {
        if (!phoneNumber) throw new BadRequestException('Phone number is required');
        const user = await this.userModel.findOne({ phoneNumber }).exec();
        if (!user) throw new NotFoundException('User not found');

        if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
            const remainingTime = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
            throw new BadRequestException(`Account is locked. Please try again in ${remainingTime} minutes`);
        }

        if (user.lockedUntil && user.lockedUntil.getTime() <= Date.now()) {
            user.failedAttempts = 0;
            user.lockedUntil = null as any;
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 60 * 1000);
        await user.save();

        await sendOTP(phoneNumber, otp);
        return { phoneNumber: user.phoneNumber, message: 'OTP resent successfully' };
    }

    async updateProfile(userId: string, fullName: string) {
        if (!userId || !fullName) throw new BadRequestException('userId and fullName are required');
        const updated = await this.userModel.findByIdAndUpdate(userId, { fullName }, { new: true }).exec();
        if (!updated) throw new NotFoundException('User not found');
        return { userId: updated._id, fullName: updated.fullName };
    }

    async getUserProfileInfo(userId: string) {
        if (!userId) throw new BadRequestException('User ID is required');
        const user = await this.userModel.findById(userId).exec();
        if (!user) throw new NotFoundException('User not found');

        const orders = await this.orderModel.aggregate([
            { $match: { userId: user._id, status: { $in: ['PAID', 'COMPLETED'] } } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSavedMoney: {
                        $sum: {
                            $multiply: [
                                { $subtract: ['$packageSnapshot.originalPrice', '$packageSnapshot.offerPrice'] },
                                '$quantity',
                            ],
                        },
                    },
                },
            },
        ]).exec();

        const totalOrders = orders.length > 0 ? orders[0].totalOrders : 0;
        const totalSavedMoney = orders.length > 0 ? orders[0].totalSavedMoney : 0;

        const baseOrderPoints = 5;
        const savedMoneyPerPoint = 100;

        let tierMultiplier = 1;
        if (totalSavedMoney >= 2000) tierMultiplier = 2;
        else if (totalSavedMoney >= 1000) tierMultiplier = 1.5;

        let bonusPoints = 0;
        if (totalOrders >= 50) bonusPoints = 100;
        else if (totalOrders >= 20) bonusPoints = 30;
        else if (totalOrders >= 10) bonusPoints = 10;

        const orderPoints = totalOrders * baseOrderPoints;
        const savedMoneyPoints = Math.floor(totalSavedMoney / savedMoneyPerPoint) * tierMultiplier;
        const totalPointsEarned = Math.floor(orderPoints + savedMoneyPoints + bonusPoints);

        return {
            fullName: user.fullName || 'kamacash user',
            phoneNumber: user.phoneNumber,
            totalOrders,
            totalSavedMoney,
            totalPointsEarned,
        };
    }
}
