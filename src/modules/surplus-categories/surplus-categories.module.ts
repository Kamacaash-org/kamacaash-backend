import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SurplusCategory, SurplusCategorySchema } from './schemas/surplus-category.schema';
import {
  SurplusPackage,
  SurplusPackageSchema,
} from '../surplus-packages/schemas/surplus-package.schema';
import { Business, BusinessSchema } from '../businesses/schemas/business.schema';
import { SurplusCategoriesService } from './surplus-categories.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SurplusCategory.name, schema: SurplusCategorySchema }]),
  ],
  providers: [SurplusCategoriesService],
  exports: [SurplusCategoriesService],
})
export class SurplusCategoriesModule {}
