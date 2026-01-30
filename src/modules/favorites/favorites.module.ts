import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BusinessesModule } from '../businesses/businesses.module';
import { Favorite, FavoriteSchema } from './schemas/favorite.schema';
import { FavoritesService } from './favorites.service';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Favorite.name, schema: FavoriteSchema }]),
    BusinessesModule,
  ],
  providers: [FavoritesService],
  exports: [FavoritesService, MongooseModule],
})
export class FavoritesModule {}
