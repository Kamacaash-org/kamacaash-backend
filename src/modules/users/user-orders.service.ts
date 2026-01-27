import { Injectable } from "@nestjs/common";
import { OrdersService } from "../orders/orders.service";

@Injectable()
export class UserOrdersService {
    constructor(
        private readonly ordersService: OrdersService,
    ) { }

    async getUserOrderSummary(userId: string) {
        return this.ordersService.getUserPaidOrCompletedOrdersSummary(userId);
    }
}
