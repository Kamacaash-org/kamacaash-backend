import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';

import { UsersService } from './users.service';
import { UsersController } from 'src/api/admin/users.controller';
import { OrdersModule } from '../orders/orders.module';
@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), OrdersModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
