// expired.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import {
  ExpiredReservation,
  ExpiredReservationDocument,
} from './schemas/expired-reservation.schema';

@Injectable()
export class ExpiredService {
  constructor(
    @InjectModel(ExpiredReservation.name)
    private readonly expiredModel: Model<ExpiredReservationDocument>,
  ) { }

  async expireBySystem(order: ExpirableOrder, session?: ClientSession, reason?: string) {
    return this.expiredModel.create(
      [
        {
          orderId: order.orderId,
          userId: order.userId,
          businessId: order.businessId,
          packageId: order.packageId,
          // packageSnapshot: order.packageSnapshot,
          amount: order.amount,
          reservedAt: order.reserved_at,
          quantityReserved: order.quantity,
          reason:
            reason ??
            'This reservation was automatically cancelled after exceeding the allowed time without confirmation.',
        },
      ],
      session ? { session } : undefined,
    );
  }

  // 🔵 Cancelled by user
  async expireByUser(order: ExpirableOrder, session?: ClientSession) {
    return this.expiredModel.create(
      [
        {
          orderId: order.orderId,
          userId: order.userId,
          businessId: order.businessId,
          packageId: order.packageId,
          // packageSnapshot: order.packageSnapshot,
          amount: order.amount,
          reservedAt: order.reserved_at,
          quantityReserved: order.quantity,
          cancelledByUser: true,
          cancelledAt: new Date(),
        },
      ],
      session ? { session } : undefined,
    );
  }
}

// expired.types.ts (or inside expired.service.ts)
export interface ExpirableOrder {
  orderId: string;
  userId: Types.ObjectId;
  businessId: Types.ObjectId;
  packageId: Types.ObjectId;

  // packageSnapshot: any;
  amount: number;
  reserved_at: Date;
  quantity: number;
}
