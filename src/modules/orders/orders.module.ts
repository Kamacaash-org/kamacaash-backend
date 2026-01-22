import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// schemas required at runtime to avoid deep TS instantiation issues
import { OrdersService } from './orders.service';
import { OrdersController } from '../../api/admin/orders.controller';

@Module({
    imports: [
        // require schemas at runtime to avoid complex compile-time types
        ((): any => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const OrderSchema = require('./schemas/order.schema').OrderSchema;
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const CancelledOrderSchema = require('../cancelled-orders/schemas/cancelled-order.schema').CancelledOrderSchema;
            const models: any = [
                { name: 'Order', schema: OrderSchema },
                { name: 'CancelledOrder', schema: CancelledOrderSchema },
            ];
            return MongooseModule.forFeature(models);
        })(),
    ],
    providers: [OrdersService],
    controllers: [OrdersController],
    exports: [OrdersService],
})
export class OrdersModule { }
