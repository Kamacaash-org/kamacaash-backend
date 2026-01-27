import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favorite, FavoriteDocument } from './schemas/favorite.schema';
import { Business, BusinessDocument } from '../businesses/schemas/business.schema';

@Injectable()
export class FavoritesService {
    constructor(
        @InjectModel(Favorite.name) private favModel: Model<FavoriteDocument>,
        @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
    ) { }

    async addFavorite(userId: string, businessId: string, note?: string) {
        if (!userId || !businessId) throw new Error('userId and businessId are required');
        const business = await this.businessModel.findById(businessId).exec();
        if (!business) throw new Error('Business not found');

        let favorite = await this.favModel.findOne({ userId, businessId }).exec();
        if (favorite) {
            if (favorite.isRemoved) {
                favorite.isRemoved = false;
                favorite.removedAt = null;
                if (note) favorite.note = note;
            } else {
                return { favorite, message: 'Business is already in favorites' };
            }
        } else {
            favorite = await this.favModel.create({ userId, businessId, note } as any);
        }

        await favorite.save();
        return { favorite };
    }

    async removeFavorite(userId: string, businessId: string) {
        if (!userId || !businessId) throw new Error('userId and businessId are required');
        const favorite = await this.favModel.findOne({ userId, businessId }).exec();
        if (!favorite || favorite.isRemoved) throw new Error('Favorite not found');
        favorite.isRemoved = true;
        favorite.removedAt = new Date();
        await favorite.save();
        return { favorite };
    }

    async getUserFavorites(userId: string) {
        if (!userId) throw new Error('userId is required');
        const favorites = await this.favModel.find({ userId, isRemoved: false }).populate({ path: 'businessId', select: 'businessName logo category', populate: { path: 'category', select: 'name slug' } }).exec();
        return { favorites };
    }
}
