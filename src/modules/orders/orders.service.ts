import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CancelledOrdersService } from '../cancelled-orders/cancelled-orders.service';
import { SurplusPackagesService } from '../surplus-packages/surplus-packages.service';
import { ReviewsService } from '../reviews/reviews.service';
import { ExpiredService } from '../expired-reservations/expired-reservation.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly cancelledOrdersService: CancelledOrdersService,
    @Inject(forwardRef(() => SurplusPackagesService))
    private readonly surplusPackagesService: SurplusPackagesService,
    private readonly reviewsService: ReviewsService,
    private readonly expiredService: ExpiredService,
  ) { }

  // #region ADMIN SERVICES

  async getPendingByBusiness(businessId: string) {
    if (!businessId) throw new BadRequestException('businessId is required');

    const pendingFilter: any = {
      businessId: new mongoose.Types.ObjectId(businessId),
      status: { $in: ['PAID', 'READY_FOR_PICKUP'] },
      paymentStatus: 'CONFIRMED',
    };

    const pendingOrders = await this.orderModel
      .find(pendingFilter)
      .populate({ path: 'userId', select: 'fullName phoneNumber' })
      .populate({ path: 'packageId', select: 'title packageImg pickupStart pickupEnd' })
      .sort({ createdAt: -1 })
      .exec();

    const now = new Date();

    const pendingArr: any[] = pendingOrders as any[];
    return pendingArr.map((order) => {
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
        orderAge:
          orderAgeMinutes >= 60
            ? `${(orderAgeMinutes / 60).toFixed(1)} hrs ago`
            : `${orderAgeMinutes} mins ago`,
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

      const surplusPackage = await this.surplusPackagesService.findByIdForOrder(
        order.packageId,
        session,
      );

      if (!surplusPackage) throw new NotFoundException('Associated package not found');

      surplusPackage.quantityAvailable = (surplusPackage.quantityAvailable || 0) + order.quantity;
      await surplusPackage.save({ session });

      await this.cancelledOrdersService.create(
        {
          orderId: order.orderId,
          userId: order.userId,
          businessId: order.businessId,
          packageId: order.packageId,
          packageSnapshot: order.packageSnapshot,
          amount: order.amount,
          quantityCancelled: order.quantity,
          cancellationReason: cancellationReason || 'Cancelled by user',
        },
        session,
      );

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

      const surplusPackage = await this.surplusPackagesService.findByIdForOrder(
        order.packageId,
        session,
      );

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

    const completedOrders = await this.orderModel
      .find(completedFilter)
      .populate({ path: 'userId', select: 'fullName phoneNumber' })
      .populate({ path: 'packageId', select: 'title packageImg pickupStart pickupEnd' })
      .sort({ completedAt: -1 })
      .exec();

    const completedArr: any[] = completedOrders as any[];
    return completedArr.map((order) => {
      const orderAgeMinutes = order.completedAt
        ? Math.floor(
          (new Date(order.completedAt).getTime() - new Date(order.reserved_at).getTime()) / 60000,
        )
        : 0;
      const completionDuration =
        order.completedAt && order.reserved_at
          ? Math.floor(
            (new Date(order.completedAt).getTime() - new Date(order.reserved_at).getTime()) /
            60000,
          )
          : null;

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

    const cancelledFilter: any = {
      businessId: new mongoose.Types.ObjectId(businessId),
      status: 'CANCELLED',
    };

    const cancelledFromOrder = await this.orderModel
      .find(cancelledFilter)
      .populate({ path: 'userId', select: 'fullName phoneNumber' })
      .populate({ path: 'packageId', select: 'title packageImg pickupStart pickupEnd' })
      .sort({ cancelledAt: -1 })
      .exec();

    const cancelledFromCancelled = await this.cancelledOrdersService.findByBusinessId(businessId);

    const all: any[] = [...(cancelledFromOrder as any[]), ...(cancelledFromCancelled as any[])];

    const map = new Map<string, any>();
    all.forEach((item) => {
      const id = (item as any).orderId || (item as any)._id.toString();
      if (!map.has(id)) map.set(id, item);
    });

    const formatted = Array.from(map.values()).map((order) => {
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
        orderAgeMinutes: order.cancelledAt
          ? Math.floor(
            (new Date(order.cancelledAt).getTime() -
              new Date(order.reserved_at || order.createdAt).getTime()) /
            60000,
          )
          : 0,
        refundProcessed: order.paymentStatus === 'REFUNDED',
      };
    });

    formatted.sort((a, b) => new Date(b.cancelledAt).getTime() - new Date(a.cancelledAt).getTime());
    return formatted;
  }

  //#endregion

  // #region APP SERVICES

  async reserveOrder(orderData: any) {

    try {

      const quantity = orderData.quantity || 1;
      const requiredFields = ['userId', 'userPhone', 'packageId', 'quantity'];
      console.log('Validating required fields:', requiredFields);
      for (const field of requiredFields) {
        if (!orderData[field]) {
          throw new BadRequestException(`Missing required field: ${field}`);
        }
      }

      if (quantity < 1) {
        throw new BadRequestException('Quantity must be at least 1');
      }

      // ✅ Let SurplusPackagesService handle stock + save
      const pkg = await this.surplusPackagesService.reservePackageQuantity(
        orderData.packageId,
        quantity,
      );

      console.log('Reserved package:', pkg._id);

      const packageSnapshot = {
        title: pkg.title,
        quantity,
        originalPrice: pkg.originalPrice,
        offerPrice: pkg.offerPrice,
        pickupStart: pkg.pickupStart,
        pickupEnd: pkg.pickupEnd,
      };

      const totalAmount = pkg.offerPrice * quantity;

      const [newOrder] = await this.orderModel.create(
        [
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
        ],
      );


      return newOrder;

    } catch (err) {
      throw err;
    }
  }

  async markOrderAsPaid(orderId: string, paymentIntentId?: string, paymentMethod?: string) {
    if (!orderId) throw new Error('Order ID is required');

    const order = await this.orderModel
      .findOneAndUpdate(
        { orderId, status: 'RESERVED', paymentStatus: 'PENDING', locked: { $ne: true } },
        {
          status: 'PAID',
          paymentStatus: 'CONFIRMED',
          paymentIntentId: paymentIntentId || null,
          paymentMethod: paymentMethod || 'EVC',
          paidAt: new Date(),
          locked: true,
        },
        { new: true },
      )
      .exec();

    if (!order) throw new Error('Order not found, already processed, or locked by system');

    const hasUserReviewed = await this.reviewsService.hasUserReviewedBusiness(
      order.userId,
      order.businessId,
    );

    return { orderId: order.orderId, pinCode: order.pinCode, hasUserReviewed: !!hasUserReviewed };
  }

  async handleExpiredReservations() {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const expirationTime = new Date(Date.now() - 5 * 60 * 1000);
      const expiredOrders = await this.orderModel
        .find({
          status: 'RESERVED',
          paymentStatus: 'PENDING',
          reserved_at: { $lt: expirationTime },
          updatedAt: { $lt: expirationTime },
          locked: { $ne: true },
        })
        .session(session);

      for (const order of expiredOrders) {
        order.locked = true;
        await order.save({ session });
        const pkg = await this.surplusPackagesService.findByIdForOrder(order.packageId, session);

        if (pkg) {
          pkg.quantityAvailable += order.quantity;
          await pkg.save({ session });
        }

        await this.expiredService.expireBySystem(
          {
            orderId: order.orderId,
            userId: order.userId,
            businessId: order.businessId,
            packageId: order.packageId,
            // packageSnapshot: order.packageSnapshot,
            amount: order.amount,
            reserved_at: order.reserved_at,
            quantity: order.quantity,
          },
          session,
        );

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

      const order = await this.orderModel
        .findOne({
          orderId,
          userId: userId,
          status: 'RESERVED',
          paymentStatus: 'PENDING',
          locked: { $ne: true },
        })
        .session(session);
      if (!order) throw new Error('Reservation not found or cannot be cancelled');

      order.locked = true;
      await order.save({ session });

      const pkg = await this.surplusPackagesService.findByIdForOrder(order.packageId, session);
      if (pkg) {
        pkg.quantityAvailable += order.quantity;
        await pkg.save({ session });
      }

      await this.expiredService.expireByUser(order, session);

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

    const pendingOrders = await this.orderModel
      .find({ userId, status: { $in: ['PAID', 'READY_FOR_PICKUP'] }, paymentStatus: 'CONFIRMED' })
      .populate({ path: 'packageId', select: 'title packageImg pickupEnd pickupStart' })
      .populate({ path: 'businessId', select: 'businessName' })
      .sort({ createdAt: -1 })
      .exec();

    const completedOrders = await this.orderModel
      .find({ userId, status: 'COMPLETED', paymentStatus: 'CONFIRMED' })
      .populate({ path: 'packageId', select: 'title packageImg pickupEnd pickupStart' })
      .populate({ path: 'businessId', select: 'businessName' })
      .sort({ completedAt: -1 })
      .exec();

    const cancelledOrders = await this.orderModel
      .find({ userId, status: 'CANCELLED', paymentStatus: 'REFUNDED' })
      .populate({ path: 'packageId', select: 'title packageImg pickupEnd pickupStart' })
      .populate({ path: 'businessId', select: 'businessName' })
      .sort({ cancelledAt: -1 })
      .exec();

    const reviewedBusinesses = await this.reviewsService.getReviewedBusinessIdsByUser(userId);

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
      hasUserReviewedBusiness: reviewedBusinesses
        .map((id: any) => id.toString())
        .includes(order.businessId?._id?.toString()),
    });

    return {
      pending: pendingOrders.map(formatOrder),
      completed: completedOrders.map(formatOrder),
      cancelled: cancelledOrders.map(formatOrder),
    };
  }

  // #endregion

  async getUserPaidOrCompletedOrdersSummary(userId: string) {
    const orders = await this.orderModel
      .aggregate([
        {
          $match: {
            userId: userId,
            status: { $in: ['PAID', 'COMPLETED'] },
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSavedMoney: {
              $sum: {
                $multiply: [
                  {
                    $subtract: ['$packageSnapshot.originalPrice', '$packageSnapshot.offerPrice'],
                  },
                  '$quantity',
                ],
              },
            },
          },
        },
      ])
      .exec();

    return orders[0] || { totalOrders: 0, totalSavedMoney: 0 };
  }
}
