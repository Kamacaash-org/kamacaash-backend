import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

const calculateDiscount = (originalPrice: number, offerPrice: number) => {
    return originalPrice > 0 ? Math.round(((originalPrice - offerPrice) / originalPrice) * 100) : 0;
};

@Injectable()
export class AppSurplusPackagesService {
    constructor(
        @InjectModel('SurplusPackage') private pkgModel: Model<any>,
        @InjectModel('Review') private reviewModel: Model<any>,
        @InjectModel('Business') private businessModel: Model<any>,
        @InjectModel('User') private userModel: Model<any>,
    ) { }

    async getSurplusPackagesForList() {
        const packages = await this.pkgModel.find({ isActive: true })
            .populate({ path: 'businessId', select: 'businessName address logo category', populate: { path: 'category', select: 'name _id' } })
            .sort({ createdAt: -1 })
            .exec();

        const result = await Promise.all(
            packages.map(async (pkg: any) => {
                const reviewAggregation = await this.reviewModel.aggregate([
                    { $match: { businessId: pkg.businessId._id } },
                    { $group: { _id: null, totalRating: { $sum: '$rating' }, count: { $sum: 1 } } },
                ]).exec();

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
        const pkg = await this.pkgModel.findById(packageId)
            .populate({ path: 'businessId', select: 'businessName address logo category', populate: { path: 'category', select: 'name _id' } })
            .exec();

        if (!pkg || !pkg.isActive) throw new Error('Package not found or inactive');

        const businessReviews = await this.reviewModel.find({ businessId: pkg.businessId._id }).sort({ createdAt: -1 }).exec();
        const totalUsersReviewedBusiness = businessReviews.length;
        const businessReviewRate = totalUsersReviewedBusiness > 0 ? businessReviews.reduce((acc: any, r: any) => acc + r.rating, 0) / totalUsersReviewedBusiness : 0;

        const lastThreeReviews = await Promise.all(
            businessReviews.slice(0, 3).map(async (r: any) => {
                const user = await this.userModel.findById(r.userId).select('fullName phoneNumber avatar').exec();
                return {
                    fullName: user?.fullName || 'Anonymous',
                    no_of_likes: r.no_of_likes || 0,
                    no_of_dis_likes: r.no_of_dis_likes || 0,
                    phoneNumber: user?.phoneNumber,
                    userId: user?._id,
                    avatar: user?.avatar || '',
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
            items: pkg.items || [],
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
}
