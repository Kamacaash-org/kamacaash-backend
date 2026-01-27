import { Module } from '@nestjs/common';
import { AppSurplusCategoriesController } from './surplus-categories.controller';
import { AppReviewsController } from './reviews.controller';
import { AppSurplusPackagesController } from './surplus-packages.controller';
import { AppOrdersController } from './orders.controller';
import { AppFavoritesController } from './favorites.controller';
import { AppBusinessesController } from './businesses.controller';
import { AppUsersController } from './app-users.controller';
import { BusinessesModule } from 'src/modules/businesses/businesses.module';
import { SurplusCategoriesModule } from 'src/modules/surplus-categories/surplus-categories.module';
import { SurplusPackagesModule } from 'src/modules/surplus-packages/surplus-packages.module';
import { StaffModule } from 'src/modules/staff/staff.module';
import { UsersModule } from 'src/modules/users/users.module';
import { OrdersModule } from 'src/modules/orders/orders.module';



@Module({
    imports: [
        BusinessesModule,
        SurplusCategoriesModule,
        SurplusPackagesModule,
        StaffModule,
        UsersModule,
        OrdersModule,
    ],
    controllers: [
        AppSurplusCategoriesController,
        AppReviewsController,
        AppSurplusPackagesController,
        AppOrdersController,
        AppFavoritesController,
        AppBusinessesController,
        AppUsersController,
    ],
})
export class AppMobileModule { }
