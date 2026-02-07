import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

interface StaffData {
  email: string;
  username?: string;
  // countryCode: string;
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
    const result = await this.staffModel.find().sort({ createdAt: -1 }).lean().exec();
    const withFullName = result.map((item) => ({
      ...item,
      fullName: `${item.firstName} ${item.lastName}`,
    }));

    return withFullName;
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
      countryCode: process.env.COUNTRY_CODE || '+252',
      mustChangePassword: true,
      // password: process.env.DEFAULT_STAFF_USER || 'Kamacaash@123',
    };

    const created = new this.staffModel(payload);
    return created.save();
  }

  async update(id: string, updateData: Partial<StaffData>) {
    const staff = await this.staffModel.findOne({ _id: id }).exec();
    if (!staff) throw new NotFoundException('Staff not found');

    if (updateData.phone && updateData.phone !== staff.phone) {
      const existing = await this.staffModel
        .findOne({ phone: updateData.phone, isActive: true, _id: { $ne: id } })
        .exec();
      if (existing)
        throw new BadRequestException('Another staff with this phone number already exists');
    }

    const updated = await this.staffModel
      .findOneAndUpdate({ _id: id }, updateData, { new: true, runValidators: true })
      .exec();
    return updated;
  }

  async changePassword(
    staffId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const staff = await this.staffModel.findById(staffId).exec();
    if (!staff) throw new NotFoundException('Staff not found');

    // Validate current password
    const isCorrect = await staff.correctPassword(currentPassword);
    if (!isCorrect) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Prevent same password
    const isSame = await staff.correctPassword(newPassword);
    if (isSame) {
      throw new BadRequestException('New password must be different from current password');
    }

    staff.password = newPassword; // will be hashed by pre('save')
    staff.mustChangePassword = false; // ✅ password changed successfully
    await staff.save();

    return { success: true, message: 'Password changed successfully' };
  }


  async softDelete(id: string) {
    const staff = await this.staffModel.findOne({ _id: id }).exec();

    if (!staff) throw new NotFoundException('Staff not found');
    staff.isActive = false;
    await staff.save();
    return { success: true };
  }
}
