import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Staff, StaffDocument } from './schemas/staff.schema';

@Injectable()
export class StaffService {
    constructor(@InjectModel(Staff.name) private staffModel: Model<StaffDocument>) { }

    async findAll() {
        return this.staffModel.find().sort({ createdAt: -1 }).exec();
    }

    async create(data: Partial<Staff>) {
        // Check if phone already exists
        const existing = await this.staffModel.findOne({ phone: data.phone, isActive: true }).exec();
        if (existing) {
            throw new BadRequestException('Staff with this phone number already exists');
        }

        // Apply defaults
        const payload: any = {
            ...data,
            countryCode: process.env.COUNTRY_CODE || data.countryCode,
            password: process.env.DEFAULT_STAFF_USER || data.password,
        };

        const created = new this.staffModel(payload);
        return created.save();
    }

    async update(id: string, updateData: Partial<Staff>) {
        const staff = await this.staffModel.findById(id).exec();
        if (!staff) throw new NotFoundException('Staff not found');

        if (updateData.phone && updateData.phone !== staff.phone) {
            const existing = await this.staffModel.findOne({ phone: updateData.phone, isActive: true, _id: { $ne: id } }).exec();
            if (existing) throw new BadRequestException('Another staff with this phone number already exists');
        }

        const updated = await this.staffModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
        return updated;
    }

    async softDelete(id: string) {
        const staff = await this.staffModel.findById(id).exec();
        if (!staff) throw new NotFoundException('Staff not found');
        staff.isActive = false;
        await staff.save();
        return { success: true };
    }
}
