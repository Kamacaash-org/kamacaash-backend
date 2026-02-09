import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Business, BusinessDocument } from './schemas/business.schema';
import { S3Service } from '../../services/s3/s3.service';
import { Staff } from '../staff/schemas/staff.schema';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/app.config';
import { EditBusinessSettingsDto } from './dto/editBusinessSettings.dto';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) { }

  async createOrUpdate(data: any, files: any = {}) {
    // Normalize email
    if (data.email) data.email = data.email.toLowerCase().trim();

    // Get app config for default values
    const appConfig = this.configService.get<AppConfig>('app');

    const isUpdate = !!data._id;

    if (isUpdate) {
      const { _id } = data;
      const business = await this.businessModel.findById(_id).exec();
      if (!business) throw new NotFoundException('Business not found');

      // Set default values from config if not provided
      if (!data.defaultLanguage) data.defaultLanguage = appConfig.business.defaultLanguage;
      if (!data.currency) data.currency = appConfig.business.currency;
      if (!data.timeZone) data.timeZone = appConfig.business.timeZone;

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
        const existing = await this.businessModel
          .findOne({ businessName: data.businessName, isActive: true, _id: { $ne: _id } })
          .exec();
        if (existing)
          throw new BadRequestException('Another business with this name already exists');
      }

      if (data.phoneNumber && data.phoneNumber !== business.phoneNumber) {
        const existingPhone = await this.businessModel
          .findOne({ phoneNumber: data.phoneNumber, isActive: true, _id: { $ne: _id } })
          .exec();
        if (existingPhone)
          throw new BadRequestException('Another business with this phone number already exists');
      }

      if (data.email && data.email !== business.email) {
        const existingEmail = await this.businessModel
          .findOne({ email: data.email, isActive: true, _id: { $ne: _id } })
          .exec();
        if (existingEmail)
          throw new BadRequestException('Another business with this email already exists');
      }

      // Validate primaryStaffAccount if provided
      if (
        data.primaryStaffAccount &&
        data.primaryStaffAccount.toString() !== business.primaryStaffAccount?.toString()
      ) {
        // ensure staff exists and active
        const StaffModel: any = this.businessModel.db.model('Staff');
        const staff: any = await StaffModel.findById(data.primaryStaffAccount).exec();
        if (!staff || !staff.isActive)
          throw new BadRequestException('Primary staff account is invalid or inactive');
      }

      // File uploads
      if (files.logo && files.logo.length > 0) {
        if (business.logo) await this.s3Service.deleteUrl(business.logo);
        data.logo = await this.s3Service.uploadBuffer(
          files.logo[0].buffer,
          files.logo[0].originalname,
          files.logo[0].mimetype,
          'logos',
        );
      }

      if (files.bannerImage && files.bannerImage.length > 0) {
        if (business.bannerImage) await this.s3Service.deleteUrl(business.bannerImage);
        data.bannerImage = await this.s3Service.uploadBuffer(
          files.bannerImage[0].buffer,
          files.bannerImage[0].originalname,
          files.bannerImage[0].mimetype,
          'banners',
        );
      }

      if (files.licenseDocument && files.licenseDocument.length > 0) {
        if (business.licenseDocument) await this.s3Service.deleteUrl(business.licenseDocument);
        data.licenseDocument = await this.s3Service.uploadBuffer(
          files.licenseDocument[0].buffer,
          files.licenseDocument[0].originalname,
          files.licenseDocument[0].mimetype,
          'licenses',
        );
      }

      // Filter out undefined values to avoid overwriting existing data
      const updateData: any = {};
      for (const key in data) {
        if (data[key] !== undefined) {
          updateData[key] = data[key];
        }
      }

      console.log('Data to update:', JSON.stringify(updateData, null, 2));

      // Update the business document directly to handle subdocuments properly
      for (const key in updateData) {
        if (key === 'openingHours' && updateData[key]) {
          business.openingHours = updateData[key];
          business.markModified('openingHours');
        } else {
          business[key] = updateData[key];
        }
      }
      await business.save();
      console.log('Updated business:', JSON.stringify(business, null, 2));
      return business;
    }

    // CREATE path
    const existingBusiness = await this.businessModel
      .findOne({ businessName: data.businessName, isActive: true })
      .exec();
    const existingEmail = data.email
      ? await this.businessModel.findOne({ email: data.email, isActive: true }).exec()
      : null;
    const existingPhone = await this.businessModel
      .findOne({ phoneNumber: data.phoneNumber, isActive: true })
      .exec();

    if (existingBusiness) throw new BadRequestException('Business with this name already exists');
    if (existingEmail) throw new BadRequestException('Business with this email already exists');
    if (existingPhone)
      throw new BadRequestException('Business with this phone number already exists');

    if (data.primaryStaffAccount) {
      const StaffModel: any = this.businessModel.db.model('Staff');
      const staff: any = await StaffModel.findById(data.primaryStaffAccount).exec();
      if (!staff || !staff.isActive)
        throw new BadRequestException('Primary staff account is invalid or inactive');
    }

    if (files.logo && files.logo.length > 0) {
      data.logo = await this.s3Service.uploadBuffer(
        files.logo[0].buffer,
        files.logo[0].originalname,
        files.logo[0].mimetype,
        'logos',
      );
    }

    if (files.bannerImage && files.bannerImage.length > 0) {
      data.bannerImage = await this.s3Service.uploadBuffer(
        files.bannerImage[0].buffer,
        files.bannerImage[0].originalname,
        files.bannerImage[0].mimetype,
        'banners',
      );
    }

    if (files.licenseDocument && files.licenseDocument.length > 0) {
      data.licenseDocument = await this.s3Service.uploadBuffer(
        files.licenseDocument[0].buffer,
        files.licenseDocument[0].originalname,
        files.licenseDocument[0].mimetype,
        'licenses',
      );
    }

    const created = new this.businessModel(data);

    // Skip coordinates during business registration - they will be set during first surplus package upload
    if (created.address && created.address.coordinates) {
      created.address.coordinates = undefined;
    }

    // Set contract with default values
    created.contract = {
      commissionRate: appConfig.business.commissionRate,
      payoutSchedule: 'WEEKLY',
      isSigned: false,
    } as any;

    // Set default values from config if not provided
    if (!created.defaultLanguage) created.defaultLanguage = appConfig.business.defaultLanguage;
    if (!created.currency) created.currency = appConfig.business.currency;
    if (!created.timeZone) created.timeZone = appConfig.business.timeZone;

    const savedBusiness = await created.save();

    console.log('Created business:', JSON.stringify(savedBusiness, null, 2));
    return savedBusiness;
  }

  async findAll(query: any = {}) {
    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.isActive !== undefined)
      filter.isActive = query.isActive === 'true' || query.isActive === true;
    if (query.category) filter.category = query.category;
    if (query.search) filter.businessName = { $regex: query.search, $options: 'i' };
    filter.isArchived = false;

    return this.businessModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate('primaryStaffAccount', 'firstName lastName email phone')
      .exec();
  }

  async findById(id: string) {
    return this.businessModel
      .findById(id)
      .populate('primaryStaffAccount', 'firstName lastName email phone')
      .exec();
  }

  async archive(id: string) {
    const business = await this.businessModel.findById(id).exec();
    if (!business) throw new NotFoundException('Business not found');
    business.isArchived = true;
    await business.save();
    return business;
  }

  async toggleActive(id: string, isActive: boolean) {
    const business = await this.businessModel
      .findByIdAndUpdate(id, { isActive }, { new: true })
      .exec();
    if (!business) throw new NotFoundException('Business not found');
    return business;
  }

  async approve(id: string) {
    const business = await this.businessModel
      .findByIdAndUpdate(id, { status: 'APPROVED', rejectionReason: null }, { new: true })
      .exec();
    if (!business) throw new NotFoundException('Business not found');
    return business;
  }

  async reject(id: string, reason: string) {
    if (!reason) throw new BadRequestException('Rejection reason is required');
    const business = await this.businessModel
      .findByIdAndUpdate(id, { status: 'REJECTED', rejectionReason: reason }, { new: true })
      .exec();
    if (!business) throw new NotFoundException('Business not found');
    return business;
  }

  async signContract(id: string, file?: any) {
    const business = await this.businessModel.findById(id).exec();
    if (!business) throw new NotFoundException('Business not found');

    if (file) {
      const url = await this.s3Service.uploadBuffer(
        file.buffer,
        file.originalname,
        file.mimetype,
        'agreements',
      );
      business.contract = business.contract || ({} as any);
      business.contract.agreementPdf = url;
    }

    business.contract = business.contract || ({} as any);
    business.contract.isSigned = true;
    business.contract.signedDate = new Date();

    await business.save();
    return business;
  }

  async updateBusinessCoordinates(businessId: string, coordinates: [number, number]) {
    const business = await this.businessModel.findById(businessId).exec();
    if (!business) throw new NotFoundException('Business not found');

    // Only update coordinates if they haven't been set yet (first surplus package)
    if (!business.address || !business.address.coordinates) {
      if (!business.address) {
        business.address = {} as any;
      }
      business.address.coordinates = {
        type: 'Point',
        coordinates: coordinates
      };
      await business.save();
    }

    return business;
  }

  async findBusinessById(businessId: string) {
    return this.businessModel.findById(businessId).exec();
  }

  async findByPrimaryStaffAccount(staffId: string) {
    return this.businessModel
      .findOne({ primaryStaffAccount: staffId, isActive: true })
      .select('_id businessName')
      .exec();
  }

  async getBusinessByPrimaryStaff(staffId: string) {
    const business = await this.businessModel
      .findOne({
        primaryStaffAccount: staffId,
        isActive: true,
        isArchived: false,
      })
      .select('businessName logo')
      .lean()
      .exec();

    return business;
  }

  /**
  * Get business profile by ID
  * Only return fields safe for staff/business owner
  */
  async getBusinessProfile(businessId: string) {
    if (!Types.ObjectId.isValid(businessId)) {
      throw new NotFoundException('Invalid business ID');
    }

    const business = await this.businessModel
      .findById(businessId)
      .select([
        'businessName',
        'logo',
        'bannerImage',
        'description',
        'phoneNumber',
        'email',
        'address',
        'openingHours',
      ])
      .lean()
      .exec();

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return {
      ...business,
      _id: business._id.toString(), // map to string
    };
  }


  async editBusinessSettings(
    businessId: string,
    data: EditBusinessSettingsDto,
    files?: { logo?: Express.Multer.File[]; bannerImage?: Express.Multer.File[] },
  ) {
    if (!Types.ObjectId.isValid(businessId)) throw new NotFoundException('Invalid business ID');

    const business = await this.businessModel.findById(businessId).exec();
    if (!business) throw new NotFoundException('Business not found');

    // Handle file uploads & remove old
    if (files?.logo?.length) {
      if (business.logo) await this.s3Service.deleteUrl(business.logo);
      business.logo = await this.s3Service.uploadBuffer(
        files.logo[0].buffer,
        files.logo[0].originalname,
        files.logo[0].mimetype,
        'logos',
      );
    }

    if (files?.bannerImage?.length) {
      if (business.bannerImage) await this.s3Service.deleteUrl(business.bannerImage);
      business.bannerImage = await this.s3Service.uploadBuffer(
        files.bannerImage[0].buffer,
        files.bannerImage[0].originalname,
        files.bannerImage[0].mimetype,
        'banners',
      );
    }

    // Filter out undefined values
    const updateData: any = {};
    for (const key in data) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }

    // Update subdocuments properly
    for (const key in updateData) {
      if (key === 'openingHours' && updateData[key]) {
        business.openingHours = updateData[key];
        business.markModified('openingHours');
      } else if (key === 'address' && updateData[key]) {
        business.address = { ...business.address, ...updateData[key] };
        business.markModified('address');
      } else {
        business[key] = updateData[key];
      }
    }

    await business.save();

    return {
      _id: business._id.toString(),
      businessName: business.businessName,
      logo: business.logo,
      bannerImage: business.bannerImage,
      description: business.description,
      phoneNumber: business.phoneNumber,
      email: business.email,
      address: business.address,
      openingHours: business.openingHours,
    };

  }


  //#endregion
}
