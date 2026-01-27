import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configs from 'src/config/index';
import { DatabaseService } from './database/database.service';
import { DatabaseModule } from './database/database.module';
import { AdminModule } from './api/admin/admin.module';
import { AppMobileModule } from './api/mobile/mobile.module';
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
    AdminModule,
    AppMobileModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
