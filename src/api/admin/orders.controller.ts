import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrdersService } from '../../modules/orders/orders.service';
import { CancelOrderDto } from '../../modules/orders/dto/cancel-order.dto';
import { CompleteOrderDto } from '../../modules/orders/dto/complete-order.dto';
import { ApiResponse } from '../../utils/response.util';
import { MESSAGES } from '../../constants/messages';

@Controller('admin/orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get('pending/:businessId')
  async getPending(@Param('businessId') businessId: string): Promise<ApiResponse<any>> {
    try {
      const data = await this.service.getPendingByBusiness(businessId);
      return new ApiResponse(200, data, MESSAGES.ADMIN_ORDER.GET_PENDING);
    } catch (err: any) {
      throw new HttpException(err.message || 'Failed', err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Post('cancel')
  @UsePipes(new ValidationPipe({ transform: true }))
  async cancel(@Body() body: CancelOrderDto): Promise<ApiResponse<any>> {
    try {
      const { orderId, cancellationReason } = body;
      const data = await this.service.cancelOrder(orderId, cancellationReason);
      return new ApiResponse(200, data, MESSAGES.ADMIN_ORDER.CANCEL);
    } catch (err: any) {
      throw new HttpException(err.message || 'Failed', err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Post('complete')
  @UsePipes(new ValidationPipe({ transform: true }))
  async complete(@Body() body: CompleteOrderDto): Promise<ApiResponse<any>> {
    try {
      const { orderId, pinCode, completedBy } = body;
      const data = await this.service.completeOrder(orderId, pinCode, completedBy);
      return new ApiResponse(200, data, MESSAGES.ADMIN_ORDER.COMPLETE);
    } catch (err: any) {
      throw new HttpException(err.message || 'Failed', err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get('completed/:businessId')
  async getCompleted(@Param('businessId') businessId: string): Promise<ApiResponse<any>> {
    try {
      const data = await this.service.getCompletedByBusiness(businessId);
      return new ApiResponse(200, data, MESSAGES.ADMIN_ORDER.GET_COMPLETED);
    } catch (err: any) {
      throw new HttpException(err.message || 'Failed', err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get('cancelled/:businessId')
  async getCancelled(@Param('businessId') businessId: string): Promise<ApiResponse<any>> {
    try {
      const data = await this.service.getCancelledByBusiness(businessId);
      return new ApiResponse(200, data, MESSAGES.ADMIN_ORDER.GET_CANCELLED);
    } catch (err: any) {
      throw new HttpException(err.message || 'Failed', err.status || HttpStatus.BAD_REQUEST);
    }
  }
}
