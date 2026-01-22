import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SurplusCategoriesModule } from './modules/surplus-categories/surplus-categories.module';
import { SurplusPackagesModule } from './modules/surplus-packages/surplus-packages.module';
import { StaffModule } from './modules/staff/staff.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { OrdersModule } from './modules/orders/orders.module';
// import { AppUsersModule } from './app-mobile/app-users.module';
import { AppMobileModule } from './api/mobile/mobile.module';
import configs from 'src/config/index';
import { DatabaseService } from './database/database.service';
import { DatabaseModule } from './database/database.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: configs,
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [DatabaseService],
      imports: [DatabaseModule],
      useFactory: (databaseService: DatabaseService) => databaseService.createMongooseOptions(),
    }),
    UsersModule,
    SurplusPackagesModule,
    StaffModule,
    BusinessesModule,
    OrdersModule,
    AppMobileModule,
    AuthModule,
    // Surplus categories module
    SurplusCategoriesModule,
    // Surplus packages module
    SurplusPackagesModule,
    // Staff module
    StaffModule,
    // Businesses module
    BusinessesModule,
    // Orders module
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
