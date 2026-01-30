import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from 'src/modules/orders/orders.service';
import { ReserveOrderDto } from '../../modules/orders/dto/reserve-order.dto';
import { MarkPaidDto } from '../../modules/orders/dto/mark-paid.dto';
import { CancelReservationDto } from '../../modules/orders/dto/cancel-reservation.dto';
import { ApiResponse } from '../../utils/response.util';
import { MESSAGES } from '../../constants/messages';

@Controller('app/orders')
export class AppOrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post('reserve')
  @UsePipes(new ValidationPipe({ transform: true }))
  async reserve(@Body() dto: ReserveOrderDto): Promise<ApiResponse<any>> {
    try {
      const order = await this.service.reserveOrder(dto);
      return new ApiResponse(201, { order }, MESSAGES.MOBILE_ORDER.RESERVE);
    } catch (err: any) {
      throw new HttpException(err.message || 'Error', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('mark-paid')
  @UsePipes(new ValidationPipe({ transform: true }))
  async markPaid(@Body() dto: MarkPaidDto): Promise<ApiResponse<any>> {
    try {
      const result = await this.service.markOrderAsPaid(
        dto.orderId,
        dto.paymentIntentId,
        dto.paymentMethod,
      );
      return new ApiResponse(200, { order: result }, MESSAGES.MOBILE_ORDER.MARK_PAID);
    } catch (err: any) {
      throw new HttpException(err.message || 'Error', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('cancel-reservation')
  @UsePipes(new ValidationPipe({ transform: true }))
  async cancelReservation(@Body() dto: CancelReservationDto): Promise<ApiResponse<any>> {
    try {
      const result = await this.service.cancelReservation(dto.userId, dto.orderId);
      return new ApiResponse(200, result, MESSAGES.MOBILE_ORDER.CANCEL_RESERVATION);
    } catch (err: any) {
      throw new HttpException(err.message || 'Error', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('user/:userId')
  async getUserOrders(@Param('userId') userId: string): Promise<ApiResponse<any>> {
    try {
      const data = await this.service.getUserOrders(userId);
      return new ApiResponse(200, data, MESSAGES.MOBILE_ORDER.GET_USER_ORDERS);
    } catch (err: any) {
      throw new HttpException(err.message || 'Error', HttpStatus.BAD_REQUEST);
    }
  }
}
