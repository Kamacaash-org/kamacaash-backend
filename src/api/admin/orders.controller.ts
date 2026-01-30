import { Controller, Get, Post, Body, Param, HttpException, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrdersService } from '../../modules/orders/orders.service';
import { CancelOrderDto } from '../../modules/orders/dto/cancel-order.dto';
import { CompleteOrderDto } from '../../modules/orders/dto/complete-order.dto';

@Controller('admin/orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) { }

  @Get('pending/:businessId')
  async getPending(@Param('businessId') businessId: string) {
    try {
      return await this.service.getPendingByBusiness(businessId);
    } catch (err: any) {
      throw new HttpException(err.message || 'Failed', err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Post('cancel')
  @UsePipes(new ValidationPipe({ transform: true }))
  async cancel(@Body() body: CancelOrderDto) {
    try {
      const { orderId, cancellationReason } = body;
      return await this.service.cancelOrder(orderId, cancellationReason);
    } catch (err: any) {
      throw new HttpException(err.message || 'Failed', err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Post('complete')
  @UsePipes(new ValidationPipe({ transform: true }))
  async complete(@Body() body: CompleteOrderDto) {
    try {
      const { orderId, pinCode, completedBy } = body;
      return await this.service.completeOrder(orderId, pinCode, completedBy);
    } catch (err: any) {
      throw new HttpException(err.message || 'Failed', err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get('completed/:businessId')
  async getCompleted(@Param('businessId') businessId: string) {
    try {
      return await this.service.getCompletedByBusiness(businessId);
    } catch (err: any) {
      throw new HttpException(err.message || 'Failed', err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get('cancelled/:businessId')
  async getCancelled(@Param('businessId') businessId: string) {
    try {
      return await this.service.getCancelledByBusiness(businessId);
    } catch (err: any) {
      throw new HttpException(err.message || 'Failed', err.status || HttpStatus.BAD_REQUEST);
    }
  }
}
