import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { SurplusPackage, SurplusPackageDocument } from '../surplus-packages/schemas/surplus-package.schema';
import { CancelledOrder, CancelledOrderDocument } from '../cancelled-orders/schemas/cancelled-order.schema';

@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(CancelledOrder.name) private cancelledModel: Model<CancelledOrderDocument>,
    ) {
        // obtain SurplusPackage model dynamically (registered in SurplusPackagesModule)
        this.packageModel = (this.orderModel.db as any).model('SurplusPackage');
    }

    // dynamic model for SurplusPackage
    private packageModel: any;

    async getPendingByBusiness(businessId: string) {
        if (!businessId) throw new BadRequestException('businessId is required');

        const pendingFilter: any = {
            businessId: new mongoose.Types.ObjectId(businessId),
            status: { $in: ['PAID', 'READY_FOR_PICKUP'] },
            paymentStatus: 'CONFIRMED',
        };

        const pendingOrders = await this.orderModel.find(pendingFilter)
            .populate({ path: 'userId', select: 'fullName phoneNumber' })
            .populate({ path: 'packageId', select: 'title packageImg pickupStart pickupEnd' })
            .sort({ createdAt: -1 })
            .exec();

        const now = new Date();

        const pendingArr: any[] = pendingOrders as any[];
        return pendingArr.map(order => {
            const pickupStart = (order.packageId as any)?.pickupStart;
            const pickupEnd = (order.packageId as any)?.pickupEnd;

            let remainingTimeMinutes = null;
            let readableRemaining = null;

            if (pickupStart) {
                const diffMs = new Date(pickupStart).getTime() - now.getTime();
                remainingTimeMinutes = Math.floor(diffMs / 60000);

                readableRemaining =
                    remainingTimeMinutes > 0
                        ? remainingTimeMinutes >= 60
                            ? `${parseFloat((remainingTimeMinutes / 60).toFixed(1))} hrs left until pickup`
                            : `${remainingTimeMinutes} min left until pickup`
                        : 'Pickup time started';
            }

            const reservedAt = order.reserved_at;
            const orderAgeMinutes = Math.floor((now.getTime() - new Date(reservedAt).getTime()) / 60000);

            return {
                orderId: order.orderId,
                quantity: order.quantity,
                amount: order.amount,
                pinCode: order.pinCode,
                reservedAt,
                orderAgeMinutes,
                orderAge: orderAgeMinutes >= 60 ? `${(orderAgeMinutes / 60).toFixed(1)} hrs ago` : `${orderAgeMinutes} mins ago`,
                status: order.status,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                promoCode: order.promoCode || null,
                user: {
                    userId: (order.userId as any)?._id,
                    fullName: (order.userId as any)?.fullName,
                    phoneNumber: (order.userId as any)?.phoneNumber,
                },
                package: {
                    title: (order.packageId as any)?.title,
                    packageImg: (order.packageId as any)?.packageImg,
                    pickupStart,
                    pickupEnd,
                },
                remainingTimeMinutes,
                readableRemaining,
                isUrgent: typeof remainingTimeMinutes === 'number' ? remainingTimeMinutes <= 15 : false,
            };
        });
    }

    async cancelOrder(orderId: string, cancellationReason?: string) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            if (!orderId) throw new BadRequestException('Order ID is required');

            const orderFilter: any = {
                orderId,
                status: { $in: ['PAID', 'READY_FOR_PICKUP'] },
                paymentStatus: 'CONFIRMED',
            };

            const order = await this.orderModel.findOne(orderFilter).session(session).exec();

            if (!order) throw new NotFoundException('Order not found or cannot be cancelled');

            const surplusPackage = await this.packageModel.findById(order.packageId).session(session).exec();
            if (!surplusPackage) throw new NotFoundException('Associated package not found');

            surplusPackage.quantityAvailable = (surplusPackage.quantityAvailable || 0) + order.quantity;
            await surplusPackage.save({ session });

            const cancelled = new this.cancelledModel({
                orderId: order.orderId,
                userId: order.userId,
                businessId: order.businessId,
                packageId: order.packageId,
                packageSnapshot: order.packageSnapshot,
                amount: order.amount,
                quantityCancelled: order.quantity,
                cancellationReason: cancellationReason || 'Cancelled by user',
            });

            await cancelled.save({ session });

            order.status = 'CANCELLED';
            order.paymentStatus = 'REFUNDED';
            order.cancelledAt = new Date();
            order.cancellationReason = cancellationReason;
            await order.save({ session });

            await session.commitTransaction();
            session.endSession();

            return { success: true };
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
        }
    }

    async completeOrder(orderId: string, pinCode: string, completedBy: string) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            if (!orderId) throw new BadRequestException('Order ID is required');
            if (!pinCode) throw new BadRequestException('pinCode is required');
            if (!completedBy) throw new BadRequestException('completedBy is required');

            const orderFilter: any = {
                orderId,
                status: { $in: ['PAID', 'READY_FOR_PICKUP'] },
                paymentStatus: 'CONFIRMED',
            };

            const order = await this.orderModel.findOne(orderFilter).session(session).exec();

            if (!order) throw new NotFoundException('Order not found or cannot be completed');

            if (order.pinCode !== pinCode) throw new BadRequestException('Invalid pinCode provided');

            order.status = 'COMPLETED';
            order.completedAt = new Date();
            // completedBy stored as ObjectId in schema
            (order as any).completedBy = completedBy as any;
            await order.save({ session });

            const surplusPackage = await this.packageModel.findById(order.packageId).session(session).exec();
            if (!surplusPackage) throw new NotFoundException('Associated package not found');

            surplusPackage.totalOrders = (surplusPackage.totalOrders || 0) + order.quantity;
            await surplusPackage.save({ session });

            await session.commitTransaction();
            session.endSession();

            return { success: true };
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
        }
    }

    async getCompletedByBusiness(businessId: string) {
        if (!businessId) throw new BadRequestException('businessId is required');

        const completedFilter: any = {
            businessId: new mongoose.Types.ObjectId(businessId),
            status: 'COMPLETED',
            paymentStatus: 'CONFIRMED',
        };

        const completedOrders = await this.orderModel.find(completedFilter)
            .populate({ path: 'userId', select: 'fullName phoneNumber' })
            .populate({ path: 'packageId', select: 'title packageImg pickupStart pickupEnd' })
            .sort({ completedAt: -1 })
            .exec();

        const completedArr: any[] = completedOrders as any[];
        return completedArr.map(order => {
            const orderAgeMinutes = order.completedAt ? Math.floor((new Date(order.completedAt).getTime() - new Date(order.reserved_at).getTime()) / 60000) : 0;
            const completionDuration = order.completedAt && order.reserved_at ? Math.floor((new Date(order.completedAt).getTime() - new Date(order.reserved_at).getTime()) / 60000) : null;

            return {
                orderId: order.orderId,
                quantity: order.quantity,
                amount: order.amount,
                pinCode: order.pinCode,
                reservedAt: order.reserved_at,
                completedAt: order.completedAt,
                status: order.status,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                promoCode: order.promoCode || null,
                completedBy: order.completedBy || 'System',
                user: {
                    userId: (order.userId as any)?._id,
                    fullName: (order.userId as any)?.fullName,
                    phoneNumber: (order.userId as any)?.phoneNumber,
                },
                package: {
                    title: (order.packageId as any)?.title,
                    packageImg: (order.packageId as any)?.packageImg,
                    pickupStart: (order.packageId as any)?.pickupStart,
                    pickupEnd: (order.packageId as any)?.pickupEnd,
                },
                orderAgeMinutes,
                completionDuration,
            };
        });
    }

    async getCancelledByBusiness(businessId: string) {
        if (!businessId) throw new BadRequestException('businessId is required');

        const cancelledFilter: any = { businessId: new mongoose.Types.ObjectId(businessId), status: 'CANCELLED' };

        const cancelledFromOrder = await this.orderModel.find(cancelledFilter)
            .populate({ path: 'userId', select: 'fullName phoneNumber' })
            .populate({ path: 'packageId', select: 'title packageImg pickupStart pickupEnd' })
            .sort({ cancelledAt: -1 })
            .exec();

        const cancelledFromCancelled = await this.cancelledModel.find({ businessId: new mongoose.Types.ObjectId(businessId) } as any)
            .populate({ path: 'userId', select: 'fullName phoneNumber' })
            .populate({ path: 'packageId', select: 'title packageImg pickupStart pickupEnd' })
            .sort({ createdAt: -1 })
            .exec();

        const all: any[] = [...(cancelledFromOrder as any[]), ...(cancelledFromCancelled as any[])];

        const map = new Map<string, any>();
        all.forEach(item => {
            const id = (item as any).orderId || (item as any)._id.toString();
            if (!map.has(id)) map.set(id, item);
        });

        const formatted = Array.from(map.values()).map(order => {
            return {
                orderId: order.orderId,
                quantity: order.quantity || order.quantityCancelled,
                amount: order.amount,
                pinCode: order.pinCode,
                reservedAt: order.reserved_at || order.createdAt,
                cancelledAt: order.cancelledAt || order.createdAt,
                status: 'CANCELLED',
                paymentStatus: order.paymentStatus || 'REFUNDED',
                paymentMethod: order.paymentMethod,
                promoCode: order.promoCode || null,
                cancellationReason: order.cancellationReason || 'No reason provided',
                user: {
                    userId: (order.userId as any)?._id || order.userId,
                    fullName: (order.userId as any)?.fullName || 'N/A',
                    phoneNumber: (order.userId as any)?.phoneNumber || 'N/A',
                },
                package: {
                    title: (order.packageId as any)?.title || 'N/A',
                    packageImg: (order.packageId as any)?.packageImg,
                    pickupStart: (order.packageId as any)?.pickupStart,
                    pickupEnd: (order.packageId as any)?.pickupEnd,
                },
                orderAgeMinutes: order.cancelledAt ? Math.floor((new Date(order.cancelledAt).getTime() - new Date(order.reserved_at || order.createdAt).getTime()) / 60000) : 0,
                refundProcessed: order.paymentStatus === 'REFUNDED',
            };
        });

        formatted.sort((a, b) => new Date(b.cancelledAt).getTime() - new Date(a.cancelledAt).getTime());
        return formatted;
    }
}
