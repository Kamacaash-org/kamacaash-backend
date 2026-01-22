import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

@Injectable()
export class AppOrdersService {
    constructor(
        @InjectModel('Order') private orderModel: Model<any>,
        @InjectModel('SurplusPackage') private pkgModel: Model<any>,
        @InjectModel('ExpiredReservation') private expiredModel: Model<any>,
        @InjectModel('Review') private reviewModel: Model<any>,
    ) { }

    async reserveOrder(orderData: any) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const quantity = orderData.quantity || 1;
            const requiredFields = ['userId', 'userPhone', 'packageId', 'quantity'];
            for (const field of requiredFields) {
                if (!orderData[field]) throw new Error(`Missing required field: ${field}`);
            }
            if (quantity < 1) throw new Error('Quantity must be at least 1');

            const pkg = await this.pkgModel.findById(orderData.packageId).session(session).select('title businessId originalPrice offerPrice pickupStart pickupEnd quantityAvailable');
            if (!pkg) throw new Error('Package not found');
            if (pkg.quantityAvailable < quantity) throw new Error('Not enough quantity available');

            pkg.quantityAvailable -= quantity;
            await pkg.save({ session });

            const packageSnapshot = {
                title: pkg.title,
                quantity,
                originalPrice: pkg.originalPrice,
                offerPrice: pkg.offerPrice,
                pickupStart: pkg.pickupStart,
                pickupEnd: pkg.pickupEnd,
            };

            const totalAmount = pkg.offerPrice * quantity;

            const newOrder = await this.orderModel.create([
                {
                    userId: orderData.userId,
                    userPhone: orderData.userPhone,
                    businessId: pkg.businessId,
                    packageId: orderData.packageId,
                    packageSnapshot,
                    amount: totalAmount,
                    quantity,
                    status: 'RESERVED',
                    paymentStatus: 'PENDING',
                },
            ], { session });

            await session.commitTransaction();
            session.endSession();
            return newOrder[0];
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
        }
    }

    async markOrderAsPaid(orderId: string, paymentIntentId?: string, paymentMethod?: string) {
        if (!orderId) throw new Error('Order ID is required');

        const order = await this.orderModel.findOneAndUpdate(
            { orderId, status: 'RESERVED', paymentStatus: 'PENDING', locked: { $ne: true } },
            { status: 'PAID', paymentStatus: 'CONFIRMED', paymentIntentId: paymentIntentId || null, paymentMethod: paymentMethod || 'EVC', paidAt: new Date(), locked: true },
            { new: true },
        ).exec();

        if (!order) throw new Error('Order not found, already processed, or locked by system');

        const hasUserReviewed = await this.reviewModel.exists({ userId: order.userId, businessId: order.businessId });
        return { orderId: order.orderId, pinCode: order.pinCode, hasUserReviewed: !!hasUserReviewed };
    }

    async handleExpiredReservations() {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const expirationTime = new Date(Date.now() - 5 * 60 * 1000);
            const expiredOrders = await this.orderModel.find({ status: 'RESERVED', paymentStatus: 'PENDING', reserved_at: { $lt: expirationTime }, updatedAt: { $lt: expirationTime }, locked: { $ne: true } }).session(session);

            for (const order of expiredOrders) {
                order.locked = true;
                await order.save({ session });
                const pkg = await this.pkgModel.findById(order.packageId).session(session);
                if (pkg) {
                    pkg.quantityAvailable += order.quantity;
                    await pkg.save({ session });
                }

                await this.expiredModel.create([
                    {
                        orderId: order.orderId,
                        userId: order.userId,
                        businessId: order.businessId,
                        packageId: order.packageId,
                        packageSnapshot: order.packageSnapshot,
                        amount: order.amount,
                        reservedAt: order.reserved_at,
                        quantityReserved: order.quantity,
                        reason: 'This reservation was automatically cancelled after exceeding the allowed time without confirmation.',
                    },
                ], { session });

                await this.orderModel.findByIdAndDelete(order._id).session(session);
            }

            await session.commitTransaction();
            session.endSession();
            return { success: true, processed: expiredOrders.length };
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
        }
    }

    async cancelReservation(userId: string, orderId: string) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            if (!userId || !orderId) throw new Error('userId and orderId are required');

            const order = await this.orderModel.findOne({ orderId, userId, status: 'RESERVED', paymentStatus: 'PENDING', locked: { $ne: true } }).session(session);
            if (!order) throw new Error('Reservation not found or cannot be cancelled');

            order.locked = true;
            await order.save({ session });

            const pkg = await this.pkgModel.findById(order.packageId).session(session);
            if (pkg) {
                pkg.quantityAvailable += order.quantity;
                await pkg.save({ session });
            }

            await this.expiredModel.create([
                {
                    orderId: order.orderId,
                    userId: order.userId,
                    businessId: order.businessId,
                    packageId: order.packageId,
                    packageSnapshot: order.packageSnapshot,
                    amount: order.amount,
                    reservedAt: order.reserved_at,
                    quantityReserved: order.quantity,
                    cancelledByUser: true,
                    cancelledAt: new Date(),
                },
            ], { session });

            await this.orderModel.findByIdAndDelete(order._id).session(session);

            await session.commitTransaction();
            session.endSession();
            return { success: true };
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
        }
    }

    async getUserOrders(userId: string) {
        if (!userId) throw new Error('userId is required');

        const pendingOrders = await this.orderModel.find({ userId, status: { $in: ['PAID', 'READY_FOR_PICKUP'] }, paymentStatus: 'CONFIRMED' })
            .populate({ path: 'packageId', select: 'title packageImg pickupEnd pickupStart' })
            .populate({ path: 'businessId', select: 'businessName' })
            .sort({ createdAt: -1 })
            .exec();

        const completedOrders = await this.orderModel.find({ userId, status: 'COMPLETED', paymentStatus: 'CONFIRMED' })
            .populate({ path: 'packageId', select: 'title packageImg pickupEnd pickupStart' })
            .populate({ path: 'businessId', select: 'businessName' })
            .sort({ completedAt: -1 })
            .exec();

        const cancelledOrders = await this.orderModel.find({ userId, status: 'CANCELLED', paymentStatus: 'REFUNDED' })
            .populate({ path: 'packageId', select: 'title packageImg pickupEnd pickupStart' })
            .populate({ path: 'businessId', select: 'businessName' })
            .sort({ cancelledAt: -1 })
            .exec();

        const reviewedBusinesses = await this.reviewModel.find({ userId }).distinct('businessId').exec();

        const formatOrder = (order: any) => ({
            orderId: order.orderId,
            quantity: order.quantity,
            amount: order.amount,
            status: order.status,
            reservedAt: order.reserved_at,
            completedAt: order.completedAt,
            pinCode: order.pinCode,
            paymentMethod: order.paymentMethod,
            cancellationReason: order.cancellationReason || '',
            package: {
                packageId: order.packageId?._id,
                title: order.packageId?.title,
                packageImg: order.packageId?.packageImg,
                pickupStart: order.packageId?.pickupStart,
                pickupEnd: order.packageId?.pickupEnd,
            },
            business: { businessId: order.businessId?._id, businessName: order.businessId?.businessName },
            hasUserReviewedBusiness: reviewedBusinesses.map((id: any) => id.toString()).includes(order.businessId?._id?.toString()),
        });

        return {
            pending: pendingOrders.map(formatOrder),
            completed: completedOrders.map(formatOrder),
            cancelled: cancelledOrders.map(formatOrder),
        };
    }
}
