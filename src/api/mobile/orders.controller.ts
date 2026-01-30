import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrdersService } from 'src/modules/orders/orders.service';
import { ReserveOrderDto } from '../../modules/orders/dto/reserve-order.dto';
import { MarkPaidDto } from '../../modules/orders/dto/mark-paid.dto';
import { CancelReservationDto } from '../../modules/orders/dto/cancel-reservation.dto';

@Controller('app/orders')
export class AppOrdersController {
  constructor(private readonly service: OrdersService) { }

  @Post('reserve')
  @UsePipes(new ValidationPipe({ transform: true }))
  async reserve(@Body() dto: ReserveOrderDto) {
    try {
      const order = await this.service.reserveOrder(dto);
      return { success: true, data: { order }, message: 'Order reserved successfully' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error' };
    }
  }

  @Post('mark-paid')
  @UsePipes(new ValidationPipe({ transform: true }))
  async markPaid(@Body() dto: MarkPaidDto) {
    try {
      const result = await this.service.markOrderAsPaid(
        dto.orderId,
        dto.paymentIntentId,
        dto.paymentMethod,
      );
      return {
        success: true,
        data: { order: result },
        message: 'Order marked as paid successfully',
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error' };
    }
  }

  @Post('cancel-reservation')
  @UsePipes(new ValidationPipe({ transform: true }))
  async cancelReservation(@Body() dto: CancelReservationDto) {
    try {
      const result = await this.service.cancelReservation(dto.userId, dto.orderId);
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
