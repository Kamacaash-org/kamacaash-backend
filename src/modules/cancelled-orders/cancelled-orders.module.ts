import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CancelledOrderSchema } from './schemas/cancelled-order.schema';
import { CancelledOrdersService } from './cancelled-orders.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'CancelledOrder', schema: CancelledOrderSchema }])],
  providers: [CancelledOrdersService],
  exports: [CancelledOrdersService, MongooseModule],
})
export class CancelledOrdersModule {}
