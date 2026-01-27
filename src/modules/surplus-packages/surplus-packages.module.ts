import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SurplusPackage, SurplusPackageSchema } from './schemas/surplus-package.schema';
import { SurplusPackagesService } from './surplus-packages.service';
import { SurplusPackagesController } from '../../api/admin/surplus-packages.controller';
import { S3Service } from '../../services/s3/s3.service';
import { UsersModule } from '../users/users.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: SurplusPackage.name, schema: SurplusPackageSchema }]), ReviewsModule, forwardRef(() => UsersModule), //  THIS FIXES UserModel
  ],
  providers: [SurplusPackagesService, S3Service],
  controllers: [SurplusPackagesController],
  exports: [SurplusPackagesService, MongooseModule],
})
export class SurplusPackagesModule { }
