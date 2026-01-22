import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SurplusPackage, SurplusPackageDocument } from './schemas/surplus-package.schema';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class SurplusPackagesService {
    private readonly logger = new Logger(SurplusPackagesService.name);

    constructor(
        @InjectModel(SurplusPackage.name) private surplusModel: Model<SurplusPackageDocument>,
        private readonly s3Service: S3Service,
    ) { }

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
}
