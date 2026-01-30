import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Business, BusinessSchema } from './schemas/business.schema';
import { BusinessesService } from './businesses.service';
import { S3Module } from '../../services/s3/s3.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Business.name, schema: BusinessSchema }]), S3Module],
  providers: [BusinessesService],
  exports: [BusinessesService, MongooseModule],
})
export class BusinessesModule {}
