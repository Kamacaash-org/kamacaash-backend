import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrderSchema } from './schemas/order.schema';

// 👇 IMPORT MODULES (not services)
import { SurplusPackagesModule } from '../surplus-packages/surplus-packages.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { ExpiredReservationModule } from '../expired-reservations/expired-reservation.module';
import { UsersModule } from '../users/users.module';
import { CancelledOrdersModule } from '../cancelled-orders/cancelled-orders.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    CancelledOrdersModule,
    forwardRef(() => SurplusPackagesModule), // ✅ FIX
    forwardRef(() => ReviewsModule),
    forwardRef(() => ExpiredReservationModule),
    forwardRef(() => UsersModule),
  ],
  providers: [OrdersService],
  exports: [OrdersService, MongooseModule],
})
export class OrdersModule {}
