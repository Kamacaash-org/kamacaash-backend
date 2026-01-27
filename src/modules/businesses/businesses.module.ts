import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Business, BusinessSchema } from './schemas/business.schema';
import { BusinessesService } from './businesses.service';
import { S3Service } from '../../services/s3/s3.service';


@Module({
    imports: [MongooseModule.forFeature([{ name: Business.name, schema: BusinessSchema }])],
    providers: [BusinessesService, S3Service],
    exports: [BusinessesService, MongooseModule],
})
export class BusinessesModule { }
