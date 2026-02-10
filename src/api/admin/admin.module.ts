import { Module } from '@nestjs/common';
import { BusinessesController } from '../../api/admin/businesses.controller';
import { SurplusCategoriesController } from './surplus-categories.controller';
import { SurplusPackagesController } from './surplus-packages.controller';
import { OrdersController } from './orders.controller';
import { UsersController } from './users.controller';
import { StaffController } from './staff.controller';
import { AdminReviewsController } from './reviews.controller';
import { BusinessesModule } from 'src/modules/businesses/businesses.module';
import { SurplusCategoriesModule } from 'src/modules/surplus-categories/surplus-categories.module';
import { SurplusPackagesModule } from 'src/modules/surplus-packages/surplus-packages.module';
import { StaffModule } from 'src/modules/staff/staff.module';
import { UsersModule } from 'src/modules/users/users.module';
import { OrdersModule } from 'src/modules/orders/orders.module';
import { ReviewsModule } from 'src/modules/reviews/reviews.module';

@Module({
  imports: [
    BusinessesModule,
    SurplusCategoriesModule,
    SurplusPackagesModule,
    StaffModule,
    UsersModule,
    OrdersModule,
    ReviewsModule,
  ],

  controllers: [
    BusinessesController,
    SurplusCategoriesController,
    SurplusPackagesController,
    OrdersController,
    UsersController,
    StaffController,
    AdminReviewsController,
  ],
})
export class AdminModule {}
