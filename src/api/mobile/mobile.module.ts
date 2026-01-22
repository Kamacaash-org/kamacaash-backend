import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppSurplusCategoriesController } from './surplus-categories.controller';
import { AppSurplusCategoriesService } from '../../app-mobile/surplus-categories.service';
import { AppReviewsController } from './reviews.controller';
import { AppReviewsService } from '../../app-mobile/reviews.service';
import { AppSurplusPackagesController } from './surplus-packages.controller';
import { AppSurplusPackagesService } from '../../app-mobile/surplus-packages.service';
import { AppOrdersController } from './orders.controller';
import { AppOrdersService } from '../../app-mobile/orders.service';
import { AppFavoritesController } from './favorites.controller';
import { AppFavoritesService } from '../../modules/favorites/favorites.service';
import { AppBusinessesController } from './businesses.controller';
import { AppUsersController } from './app-users.controller';
import { AppUsersService } from '../../app-mobile/app-users.service';

// require schemas at runtime to avoid TypeScript instantiation depth
const SurplusCategorySchema: any = require('../surplus-categories/schemas/surplus-category.schema').SurplusCategorySchema;
const ReviewSchema: any = require('../reviews/schemas/review.schema').ReviewSchema;
const BusinessSchema: any = require('../businesses/schemas/business.schema').BusinessSchema;
const SurplusPackageSchema: any = require('../surplus-packages/schemas/surplus-package.schema').SurplusPackageSchema;
const UserSchema: any = require('../users/schemas/user.schema').UserSchema;
const OrderSchema: any = require('../orders/schemas/order.schema').OrderSchema;
const ExpiredReservationSchema: any = require('../expired-reservations/schemas/expired-reservation.schema').ExpiredReservationSchema;
const FavoriteSchema: any = require('../favorites/schemas/favorite.schema').FavoriteSchema;

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'SurplusCategory', schema: SurplusCategorySchema },
            { name: 'Review', schema: ReviewSchema },
            { name: 'Business', schema: BusinessSchema },
            { name: 'SurplusPackage', schema: SurplusPackageSchema },
            { name: 'User', schema: UserSchema },
            { name: 'Order', schema: OrderSchema },
            { name: 'ExpiredReservation', schema: ExpiredReservationSchema },
            { name: 'Favorite', schema: FavoriteSchema },
        ] as any),
    ],
    controllers: [
        AppSurplusCategoriesController,
        AppReviewsController,
        AppSurplusPackagesController,
        AppOrdersController,
        AppFavoritesController,
        AppBusinessesController,
        // AppUsersController,
    ],
    providers: [
        AppSurplusCategoriesService,
        AppReviewsService,
        AppSurplusPackagesService,
        AppOrdersService,
        AppFavoritesService,
        // AppUsersService,
    ],
})
export class AppMobileModule { }
