import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, ObjectId, Types } from 'mongoose';
import { SurplusPackage, SurplusPackageDocument } from './schemas/surplus-package.schema';
import { Review, ReviewDocument } from '../reviews/schemas/review.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

import { S3Service } from '../../services/s3/s3.service';
import { UsersService } from '../users/users.service';
import { ReviewsService } from '../reviews/reviews.service';
const calculateDiscount = (originalPrice: number, offerPrice: number) => {
    return originalPrice > 0 ? Math.round(((originalPrice - offerPrice) / originalPrice) * 100) : 0;
};

@Injectable()
export class SurplusPackagesService {
    private readonly logger = new Logger(SurplusPackagesService.name);

    constructor(
        @InjectModel(SurplusPackage.name) private surplusModel: Model<SurplusPackageDocument>,
        private readonly usersService: UsersService,
        private readonly reviewsService: ReviewsService,

        private readonly s3Service: S3Service,
    ) { }


    //#region ADMIN SERVICES

    async findAll(query: any = {}) {
        const filter: any = {};
        if (query.businessId) filter.businessId = query.businessId;
        if (query.category) filter.category = query.category;
        if (query.isActive !== undefined) filter.isActive = query.isActive === 'true' || query.isActive === true;

        return this.surplusModel.find(filter).sort({ createdAt: -1 }).exec();
    }

    async createOrUpdate(data: any, file?: any) {
        // If file present upload and set packageImg
        if (file) {
            const url = await this.s3Service.uploadBuffer(file.buffer, file.originalname, file.mimetype);
            data.packageImg = url;
        }

        if (data._id) {
            // Update: if existing image present and new file uploaded, delete old image
            const existing = await this.surplusModel.findById(data._id).exec();
            if (!existing) throw new Error('Not found');
            if (file && existing.packageImg) {
                await this.s3Service.deleteUrl(existing.packageImg);
            }

            return this.surplusModel.findByIdAndUpdate(data._id, { $set: data }, { new: true }).exec();
        }

        const created = new this.surplusModel(data);
        return created.save();
    }

    async softDelete(id: string) {
        const doc = await this.surplusModel.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true }).exec();
        return doc;
    }

    async hardDelete(id: string) {
        const doc = await this.surplusModel.findById(id).exec();
        if (!doc) return null;
        if (doc.packageImg) {
            await this.s3Service.deleteUrl(doc.packageImg);
        }
        await this.surplusModel.deleteOne({ _id: id }).exec();
        return { deleted: true };
    }



    // surplus-packages.service.ts
    async getPackageForOrder(packageId: string, session?: ClientSession) {
        return this.surplusModel
            .findById(packageId)
            .session(session)
            .select(
                'title businessId originalPrice offerPrice pickupStart pickupEnd quantityAvailable',
            )
            .lean();
    }

    // surplus-packages.service.ts
    async findByIdForOrder(
        packageId: Types.ObjectId,
        session?: ClientSession,
    ) {
        return this.surplusModel
            .findById(packageId)
            .session(session)
            .exec();
    }



    //#endregion




    //#region  APP SERVICES
    async getSurplusPackagesForList() {
        const packages = await this.surplusModel.find({ isActive: true })
            .populate({ path: 'businessId', select: 'businessName address logo category', populate: { path: 'category', select: 'name _id' } })
            .sort({ createdAt: -1 })
            .exec();

        const result = await Promise.all(
            packages.map(async (pkg: any) => {
                const reviewAggregation = await this.reviewsService.getBusinessRatingAggregation(
                    pkg.businessId._id,
                );


                const totalUsersReviewedBusiness = reviewAggregation[0]?.count || 0;
                const businessReviewRate = totalUsersReviewedBusiness > 0 ? reviewAggregation[0].totalRating / totalUsersReviewedBusiness : 0;

                return {
                    businessId: pkg.businessId._id.toString(),
                    businessName: pkg.businessId.businessName || '',
                    categoryId: pkg.businessId.category?._id?.toString() || '',
                    categoryName: pkg.businessId.category?.name || '',
                    packageId: pkg._id.toString(),
                    packageImg: pkg.packageImg || '',
                    title: pkg.title,
                    hasBusinessReview: totalUsersReviewedBusiness > 0,
                    businessReviewRate,
                    originalPrice: pkg.originalPrice,
                    offerPrice: pkg.offerPrice,
                    discountPercent: pkg.discountPercent || calculateDiscount(pkg.originalPrice, pkg.offerPrice),
                    quantityAvailable: pkg.quantityAvailable,
                    pickupStart: pkg.pickupStart,
                    pickupEnd: pkg.pickupEnd,
                    businessLocation: pkg.businessId.address?.coordinates?.coordinates || '',
                };
            }),
        );

        return result;
    }




    async getSurplusPackageDetail(packageId: string) {
        const pkg = await this.surplusModel
            .findById(packageId)
            .populate({
                path: 'businessId',
                select: 'businessName address logo category',
                populate: { path: 'category', select: 'name _id' },
            })
            .lean<SurplusPackageLeanWithBusiness>()
            .exec();


        if (!pkg || !pkg.isActive) throw new Error('Package not found or inactive');

        const businessReviews = await this.reviewsService.getBusinessReviews(
            pkg.businessId._id,
        );

        const totalUsersReviewedBusiness = businessReviews.length;
        const businessReviewRate = totalUsersReviewedBusiness > 0 ? businessReviews.reduce((acc: any, r: any) => acc + r.rating, 0) / totalUsersReviewedBusiness : 0;

        const lastThreeReviews = await Promise.all(
            businessReviews.slice(0, 3).map(async (r: any) => {
                const user = await this.usersService.findByIdWithProfile(r.userId);
                return {
                    fullName: user?.fullName || 'Anonymous',
                    no_of_likes: r.no_of_likes || 0,
                    no_of_dis_likes: r.no_of_dis_likes || 0,
                    phoneNumber: user?.phoneNumber,
                    userId: user?._id,
                    avatar: user?.profilePicture || '',
                    rating: r.rating,
                    comment: r.comment || '',
                    reviewTime: r.createdAt,
                };
            }),
        );

        return {
            businessId: pkg.businessId._id.toString(),
            businessName: pkg.businessId.businessName || '',
            categoryId: pkg.businessId.category?._id?.toString() || '',
            categoryName: pkg.businessId.category?.name || '',
            packageId: pkg._id.toString(),
            packageImg: pkg.packageImg || '',
            title: pkg.title,
            description: pkg.description || '',
            // items: pkg.items || [],
            hasBusinessReview: totalUsersReviewedBusiness > 0,
            businessReviewRate,
            totalUsersReviewedBusiness,
            lastThreeReviews,
            originalPrice: pkg.originalPrice,
            offerPrice: pkg.offerPrice,
            discountPercent: pkg.discountPercent || calculateDiscount(pkg.originalPrice, pkg.offerPrice),
            quantityAvailable: pkg.quantityAvailable,
            pickupStart: pkg.pickupStart,
            pickupEnd: pkg.pickupEnd,
            pickupInstructions: pkg.pickupInstructions,
            businessLocation: pkg.businessId.address?.coordinates?.coordinates || '',
        };
    }

    //#endregion



}


// interface
interface CategoryPopulated {
    _id: Types.ObjectId;
    name: string;
}

interface BusinessPopulated {
    _id: Types.ObjectId;
    businessName: string;
    address?: {
        coordinates?: {
            coordinates: number[];
        };
    };
    logo?: string;
    category?: CategoryPopulated;
}

type SurplusPackageLeanWithBusiness =
    Omit<SurplusPackage, 'businessId'> & {
        _id: Types.ObjectId;
        businessId: BusinessPopulated;
    };
