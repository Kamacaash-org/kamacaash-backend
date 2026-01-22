import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SurplusPackage, SurplusPackageSchema } from './schemas/surplus-package.schema';
import { SurplusPackagesService } from './surplus-packages.service';
import { SurplusPackagesController } from './surplus-packages.controller';
import { S3Service } from '../s3/s3.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: SurplusPackage.name, schema: SurplusPackageSchema }])],
  providers: [SurplusPackagesService, S3Service],
  controllers: [SurplusPackagesController],
  exports: [SurplusPackagesService],
})
export class SurplusPackagesModule {}
