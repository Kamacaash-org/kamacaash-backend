import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusinessesService } from '../businesses/businesses.service';

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
  constructor(
    @InjectModel('Staff') private staffModel: Model<any>,
    private readonly businessService: BusinessesService,
  ) { }

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
    staff.mustChangePassword = false; //  password changed successfully
    await staff.save();

    return { success: true };
  }

  async getStaffProfile(staffId: string) {
    const staff = await this.staffModel
      .findById(staffId)
      .where({ isActive: true })
      .lean()
      .exec();

    if (!staff) {
      throw new NotFoundException('Staff profile not found');
    }

    const response: any = {
      ...staff,
      fullName: `${staff.firstName} ${staff.lastName}`,
    };
    // console.log("Staff role:", staff.role, "Staff ID:", staff._id);
    //  If BUSINESS_OWNER, attach Business info via service
    if (staff.role === 'BUSINESS_OWNER') {
      const business = await this.businessService.getBusinessByPrimaryStaff(staff._id.toString());
      if (business) {
        response.business = {
          _id: business._id.toString(),
          businessName: business.businessName,
          logo: business.logo,
        };
      }
    }

    return response;
  }




  async softDelete(id: string) {
    const staff = await this.staffModel.findOne({ _id: id }).exec();

    if (!staff) throw new NotFoundException('Staff not found');
    staff.isActive = false;
    await staff.save();
    return { success: true };
  }
}
