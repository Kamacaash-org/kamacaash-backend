import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SurplusCategory, SurplusCategoryDocument } from './schemas/surplus-category.schema';
import { CreateSurplusCategoryDto } from './dto/create-surplus-category.dto';
import { UpdateSurplusCategoryDto } from './dto/update-surplus-category.dto';

@Injectable()
export class SurplusCategoriesService {
  constructor(
    @InjectModel(SurplusCategory.name) private categoryModel: Model<SurplusCategoryDocument>,
  ) { }

  //#region ADMIN SERVICES
  async findAll() {
    return this.categoryModel.find().sort({ sortOrder: 1, name: 1 }).lean();
  }

  async findById(id: string) {
    const category = await this.categoryModel.findById(id).lean();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(dto: CreateSurplusCategoryDto) {
    const existing = await this.categoryModel.findOne({ name: dto.name, isActive: true }).lean();
    if (existing) throw new ConflictException('Category with this name already exists');
    const created = new this.categoryModel(dto as any);
    return created.save();
  }

  async update(id: string, dto: UpdateSurplusCategoryDto) {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');

    if (dto.name && dto.name !== category.name) {
      const existing = await this.categoryModel
        .findOne({ name: dto.name, isActive: true, _id: { $ne: id } })
        .lean();
      if (existing) throw new ConflictException('Another category with this name already exists');
    }

    return this.categoryModel
      .findByIdAndUpdate(id, dto as any, { new: true, runValidators: true })
      .lean();
  }

  async remove(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');

    const packageModel = this.categoryModel.db.model('SurplusPackage');
    const businessModel = this.categoryModel.db.model('Business');

    const activePackages = await packageModel.countDocuments({
      category: new Types.ObjectId(id),
      isActive: true,
    });
    const activeBusinesses = await businessModel.countDocuments({
      category: new Types.ObjectId(id),
      isActive: true,
    });

    if (activeBusinesses > 0)
      throw new BadRequestException('Cannot delete category with active Businesses');
    if (activePackages > 0)
      throw new BadRequestException('Cannot delete category with active packages');

    category.isActive = false;
    return category.save();
  }

  async activate(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    category.isActive = true;
    return category.save();
  }

  //#endregion

  //#region APP SERVICES

  async findActive() {
    return this.categoryModel
      .find({ isActive: true })
      .select('name icon')
      .sort({ sortOrder: 1 })
      .exec();
  }

  //#endregion
}
