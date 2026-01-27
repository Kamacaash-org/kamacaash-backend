import { forwardRef, Module } from "@nestjs/common";
import { UsersModule } from "./users.module";
import { OrdersModule } from "../orders/orders.module";
import { UserOrdersService } from "./user-orders.service";

@Module({
    imports: [forwardRef(() => UsersModule),
    forwardRef(() => OrdersModule),
    ],
    providers: [UserOrdersService],
    exports: [UserOrdersService],
})
export class UserOrdersModule { }
