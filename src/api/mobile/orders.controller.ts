import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppOrdersService } from '../../app-mobile/orders.service';

@Controller('app/orders')
export class AppOrdersController {
    constructor(private readonly service: AppOrdersService) { }

    @Post('reserve')
    async reserve(@Body() body: any) {
        try {
            const order = await this.service.reserveOrder(body);
            return { success: true, data: { order }, message: 'Order reserved successfully' };
        } catch (err: any) {
            return { success: false, message: err.message || 'Error' };
        }
    }

    @Post('mark-paid')
    async markPaid(@Body() body: { orderId: string; paymentIntentId?: string; paymentMethod?: string }) {
        try {
            const result = await this.service.markOrderAsPaid(body.orderId, body.paymentIntentId, body.paymentMethod);
            return { success: true, data: { order: result }, message: 'Order marked as paid successfully' };
        } catch (err: any) {
            return { success: false, message: err.message || 'Error' };
        }
    }

    @Post('cancel-reservation')
    async cancelReservation(@Body() body: { userId: string; orderId: string }) {
        try {
            const result = await this.service.cancelReservation(body.userId, body.orderId);
            return { success: true, data: result, message: 'Reservation cancelled successfully' };
        } catch (err: any) {
            return { success: false, message: err.message || 'Error' };
        }
    }

    @Get('user/:userId')
    async getUserOrders(@Param('userId') userId: string) {
        try {
            const data = await this.service.getUserOrders(userId);
            return { success: true, data, message: 'User orders fetched successfully' };
        } catch (err: any) {
            return { success: false, message: err.message || 'Error' };
        }
    }
}
