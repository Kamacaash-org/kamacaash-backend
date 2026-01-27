import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';

import { UsersService } from './users.service';
import { UsersController } from 'src/api/admin/users.controller';
import { UserOrdersService } from './user-orders.service';
import { OrdersModule } from '../orders/orders.module';
@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), forwardRef(() => OrdersModule)],
  controllers: [UsersController],
  providers: [UsersService, UserOrdersService],
  exports: [UsersService, UserOrdersService, MongooseModule],
})
export class UsersModule { }
