import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from '../../api/admin/orders.controller';

// 👇 IMPORT MODULES (not services)
import { SurplusPackagesModule } from '../surplus-packages/surplus-packages.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { ExpiredReservationModule } from '../expired-reservations/expired-reservation.module';
import { UsersModule } from '../users/users.module';


@Module({
    imports: [
        // Runtime schema loading (your workaround is fine 👍)
        ((): any => {
            const OrderSchema = require('./schemas/order.schema').OrderSchema;
            const CancelledOrderSchema = require('../cancelled-orders/schemas/cancelled-order.schema')
                .CancelledOrderSchema;

            return MongooseModule.forFeature([
                { name: 'Order', schema: OrderSchema },
                { name: 'CancelledOrder', schema: CancelledOrderSchema },
            ]);
        })(),
        forwardRef(() => SurplusPackagesModule), // ✅ FIX
        forwardRef(() => ReviewsModule),
        forwardRef(() => ExpiredReservationModule),
        forwardRef(() => UsersModule)
    ],
    providers: [OrdersService],
    controllers: [OrdersController],
    exports: [OrdersService, MongooseModule],
})
export class OrdersModule { }
