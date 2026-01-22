import { Controller, Get, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Controller('app/businesses')
export class AppBusinessesController {
    constructor(
        @InjectModel('Business') private businessModel: Model<any>,
        @InjectModel('SurplusPackage') private pkgModel: Model<any>,
        @InjectModel('Review') private reviewModel: Model<any>,
    ) { }

    @Get()
    async getbusinessList() {
        const businesses = await this.businessModel.find({}).populate('category', 'name slug').select('businessName logo category').sort({ createdAt: -1 }).exec();
        return { success: true, data: { count: businesses.length, businesses }, message: 'Businesses fetched successfully' };
    }

    @Get(':businessId')
    async getBusinessDetailWithActiveDeals(@Param('businessId') businessId: string) {
        const business = await this.businessModel.findById(businessId).populate('category', 'name').exec();
        if (!business || !business.isActive) return { success: false, message: 'Business not found or inactive' };

        const activePackages = await this.pkgModel.find({ businessId: businessId, isActive: true }).sort({ quantityAvailable: -1, offerPrice: 1 }).exec();
        const businessReviews = await this.reviewModel.find({ businessId: businessId }).sort({ createdAt: -1 }).exec();
        const totalUsersReviewedBusiness = businessReviews.length;
        const businessReviewRate = totalUsersReviewedBusiness > 0 ? businessReviews.reduce((acc: any, r: any) => acc + r.rating, 0) / totalUsersReviewedBusiness : 0;

        const deals = activePackages.map((pkg: any) => ({
            packageId: pkg._id.toString(),
            packageImg: pkg.packageImg || '',
            title: pkg.title,
            originalPrice: pkg.originalPrice,
            offerPrice: pkg.offerPrice,
            discountPercent: pkg.discountPercent || Math.round(((pkg.originalPrice - pkg.offerPrice) / pkg.originalPrice) * 100) || 0,
            quantityAvailable: pkg.quantityAvailable,
            pickupStart: pkg.pickupStart,
            pickupEnd: pkg.pickupEnd,
            businessReviewRate,
        }));

        const operatingHours = Object.keys(business.openingHours || {})
            .filter((day) => business.openingHours[day].open)
            .map((day) => {
                const dayDisplay = day.charAt(0).toUpperCase() + day.slice(1);
                return `${dayDisplay}: ${business.openingHours[day].open} - ${business.openingHours[day].close}`;
            })
            .join('; ');

        const categoryName = business.category?.name || 'Uncategorized';

        const result = {
            businessId: business._id.toString(),
            businessName: business.businessName,
            businessLogo: business.logo,
            category: categoryName,
            address: business.address?.street || business.address?.city || '',
            description: business.description || '',
            rating: businessReviewRate,
            totalReviews: totalUsersReviewedBusiness,
            phone: business.phoneNumber ? `${business.countryCode} ${business.phoneNumber}` : '',
            operatingHours: operatingHours || 'Hours not available',
            activeDeals: deals,
        };

        return { success: true, data: result };
    }
}
