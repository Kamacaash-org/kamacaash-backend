import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

interface StaffData {
  email: string;
  username?: string;
  countryCode: string;
  phone: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  permissions?: string[];
  isAdminApproved?: boolean;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  isActive?: boolean;
}

@Injectable()
export class StaffService {
  constructor(@InjectModel('Staff') private staffModel: Model<any>) { }

  async findAll() {
    return this.staffModel.find().sort({ createdAt: -1 }).exec();
  }

  async findByEmail(email: string): Promise<any | null> {
    return this.staffModel.findOne({ email, isActive: true }).exec();
  }

  async findByUsername(username: string): Promise<any | null> {
    return this.staffModel.findOne({ username, isActive: true }).exec();
  }

  async create(data: StaffData) {
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

  async update(id: string, updateData: Partial<StaffData>) {
    const staff = await this.staffModel.findById(id).exec();
    if (!staff) throw new NotFoundException('Staff not found');

    if (updateData.phone && updateData.phone !== staff.phone) {
      const existing = await this.staffModel
        .findOne({ phone: updateData.phone, isActive: true, _id: { $ne: id } })
        .exec();
      if (existing)
        throw new BadRequestException('Another staff with this phone number already exists');
    }

    const updated = await this.staffModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .exec();
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
