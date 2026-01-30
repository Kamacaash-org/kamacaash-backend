import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SurplusPackage, SurplusPackageSchema } from './schemas/surplus-package.schema';
import { SurplusPackagesService } from './surplus-packages.service';
import { S3Module } from '../../services/s3/s3.module';
import { UsersModule } from '../users/users.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { BusinessesModule } from '../businesses/businesses.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SurplusPackage.name, schema: SurplusPackageSchema }]),
    ReviewsModule,
    forwardRef(() => UsersModule),
    BusinessesModule,
    S3Module, //  THIS FIXES UserModel
  ],
  providers: [SurplusPackagesService],
  exports: [SurplusPackagesService, MongooseModule],
})
export class SurplusPackagesModule { }
