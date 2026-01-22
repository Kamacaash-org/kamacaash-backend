import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AppSurplusCategoriesService {
    constructor(@InjectModel('SurplusCategory') private model: Model<any>) { }

    async findActive() {
        return this.model.find({ isActive: true }).select('name slug icon').sort({ sortOrder: 1 }).exec();
    }
}
