import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Business, BusinessDocument } from './schemas/business.schema';
import { S3Service } from '../../services/s3/s3.service';
import { Staff } from '../staff/schemas/staff.schema';

@Injectable()
export class BusinessesService {
    constructor(
        @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
        private readonly s3Service: S3Service,
    ) { }

    async createOrUpdate(data: any, files: any = {}) {
        // Normalize email
        if (data.email) data.email = data.email.toLowerCase().trim();

        const isUpdate = !!data._id;

        if (isUpdate) {
            const { _id } = data;
            const business = await this.businessModel.findById(_id).exec();
            if (!business) throw new NotFoundException('Business not found');

            // Preserve signed contract
            if (business.contract?.isSigned) {
                data.contract = {
                    ...business.contract,
                    isSigned: business.contract.isSigned,
                    signedDate: business.contract.signedDate,
                    agreementPdf: business.contract.agreementPdf,
                };
            }

            // Uniqueness validations
            if (data.businessName && data.businessName !== business.businessName) {
                const existing = await this.businessModel.findOne({ businessName: data.businessName, isActive: true, _id: { $ne: _id } }).exec();
                if (existing) throw new BadRequestException('Another business with this name already exists');
            }

            if (data.phoneNumber && data.phoneNumber !== business.phoneNumber) {
                const existingPhone = await this.businessModel.findOne({ phoneNumber: data.phoneNumber, isActive: true, _id: { $ne: _id } }).exec();
                if (existingPhone) throw new BadRequestException('Another business with this phone number already exists');
            }

            if (data.email && data.email !== business.email) {
                const existingEmail = await this.businessModel.findOne({ email: data.email, isActive: true, _id: { $ne: _id } }).exec();
                if (existingEmail) throw new BadRequestException('Another business with this email already exists');
            }

            // Validate primaryStaffAccount if provided
            if (data.primaryStaffAccount && data.primaryStaffAccount.toString() !== business.primaryStaffAccount?.toString()) {
                // ensure staff exists and active
                const StaffModel: any = this.businessModel.db.model('Staff');
                const staff: any = await StaffModel.findById(data.primaryStaffAccount).exec();
                if (!staff || !staff.isActive) throw new BadRequestException('Primary staff account is invalid or inactive');
            }

            // File uploads
            if (files.logo && files.logo.length > 0) {
                if (business.logo) await this.s3Service.deleteUrl(business.logo);
                data.logo = await this.s3Service.uploadBuffer(files.logo[0].buffer, files.logo[0].originalname, files.logo[0].mimetype, 'logos');
            }

            if (files.bannerImage && files.bannerImage.length > 0) {
                if (business.bannerImage) await this.s3Service.deleteUrl(business.bannerImage);
                data.bannerImage = await this.s3Service.uploadBuffer(files.bannerImage[0].buffer, files.bannerImage[0].originalname, files.bannerImage[0].mimetype, 'banners');
            }

            if (files.licenseDocument && files.licenseDocument.length > 0) {
                if (business.licenseDocument) await this.s3Service.deleteUrl(business.licenseDocument);
                data.licenseDocument = await this.s3Service.uploadBuffer(files.licenseDocument[0].buffer, files.licenseDocument[0].originalname, files.licenseDocument[0].mimetype, 'licenses');
            }

            const updated = await this.businessModel.findByIdAndUpdate(_id, data, { new: true, runValidators: true }).exec();
            return updated;
        }

        // CREATE path
        const existingBusiness = await this.businessModel.findOne({ businessName: data.businessName, isActive: true }).exec();
        const existingEmail = data.email ? await this.businessModel.findOne({ email: data.email, isActive: true }).exec() : null;
        const existingPhone = await this.businessModel.findOne({ phoneNumber: data.phoneNumber, isActive: true }).exec();

        if (existingBusiness) throw new BadRequestException('Business with this name already exists');
        if (existingEmail) throw new BadRequestException('Business with this email already exists');
        if (existingPhone) throw new BadRequestException('Business with this phone number already exists');

        if (data.primaryStaffAccount) {
            const StaffModel: any = this.businessModel.db.model('Staff');
            const staff: any = await StaffModel.findById(data.primaryStaffAccount).exec();
            if (!staff || !staff.isActive) throw new BadRequestException('Primary staff account is invalid or inactive');
        }

        if (files.logo && files.logo.length > 0) {
            data.logo = await this.s3Service.uploadBuffer(files.logo[0].buffer, files.logo[0].originalname, files.logo[0].mimetype, 'logos');
        }

        if (files.bannerImage && files.bannerImage.length > 0) {
            data.bannerImage = await this.s3Service.uploadBuffer(files.bannerImage[0].buffer, files.bannerImage[0].originalname, files.bannerImage[0].mimetype, 'banners');
        }

        if (files.licenseDocument && files.licenseDocument.length > 0) {
            data.licenseDocument = await this.s3Service.uploadBuffer(files.licenseDocument[0].buffer, files.licenseDocument[0].originalname, files.licenseDocument[0].mimetype, 'licenses');
        }

        const created = new this.businessModel(data);
        return created.save();
    }

    async findAll(query: any = {}) {
        const filter: any = {};
        if (query.status) filter.status = query.status;
        if (query.isActive !== undefined) filter.isActive = query.isActive === 'true' || query.isActive === true;
        if (query.category) filter.category = query.category;
        if (query.search) filter.businessName = { $regex: query.search, $options: 'i' };
        filter.isArchived = false;

        return this.businessModel.find(filter).sort({ createdAt: -1 }).populate('primaryStaffAccount', 'firstName lastName email phone').exec();
    }

    async findById(id: string) {
        return this.businessModel.findById(id).populate('primaryStaffAccount', 'firstName lastName email phone').exec();
    }

    async archive(id: string) {
        const business = await this.businessModel.findById(id).exec();
        if (!business) throw new NotFoundException('Business not found');
        business.isArchived = true;
        await business.save();
        return business;
    }

    async toggleActive(id: string, isActive: boolean) {
        const business = await this.businessModel.findByIdAndUpdate(id, { isActive }, { new: true }).exec();
        if (!business) throw new NotFoundException('Business not found');
        return business;
    }

    async approve(id: string) {
        const business = await this.businessModel.findByIdAndUpdate(id, { status: 'APPROVED', rejectionReason: null }, { new: true }).exec();
        if (!business) throw new NotFoundException('Business not found');
        return business;
    }

    async reject(id: string, reason: string) {
        if (!reason) throw new BadRequestException('Rejection reason is required');
        const business = await this.businessModel.findByIdAndUpdate(id, { status: 'REJECTED', rejectionReason: reason }, { new: true }).exec();
        if (!business) throw new NotFoundException('Business not found');
        return business;
    }

    async signContract(id: string, file?: any) {
        const business = await this.businessModel.findById(id).exec();
        if (!business) throw new NotFoundException('Business not found');

        if (file) {
            const url = await this.s3Service.uploadBuffer(file.buffer, file.originalname, file.mimetype, 'agreements');
            business.contract = business.contract || {} as any;
            business.contract.agreementPdf = url;
        }

        business.contract = business.contract || {} as any;
        business.contract.isSigned = true;
        business.contract.signedDate = new Date();

        await business.save();
        return business;
    }



    async findBusinessById(businessId: string) {
        return this.businessModel.findById(businessId).exec();
    }


    //#region 




    //#endregion
}
