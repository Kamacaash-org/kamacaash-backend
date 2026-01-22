import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Business, BusinessSchema } from './schemas/business.schema';
import { BusinessesService } from './businesses.service';
import { BusinessesController } from './businesses.controller';
import { S3Service } from '../s3/s3.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: Business.name, schema: BusinessSchema }])],
    providers: [BusinessesService, S3Service],
    controllers: [BusinessesController],
    exports: [BusinessesService],
})
export class BusinessesModule { }
