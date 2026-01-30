import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';

interface CancelledOrderData {
    orderId: string;
    userId: any;
    businessId: any;
    packageId: any;
    packageSnapshot?: any;
    amount: number;
    quantityCancelled: number;
    cancellationReason?: string;
}

@Injectable()
export class CancelledOrdersService {
    constructor(
        @InjectModel('CancelledOrder') private cancelledOrderModel: Model<any>,
    ) { }

    async create(cancelledOrderData: CancelledOrderData, session?: ClientSession): Promise<any> {
        const cancelledOrder = new this.cancelledOrderModel(cancelledOrderData);
        return cancelledOrder.save({ session });
    }

    async findByBusinessId(businessId: string): Promise<any[]> {
        return this.cancelledOrderModel
            .find({ businessId })
            .populate({ path: 'userId', select: 'fullName phoneNumber' })
            .populate({ path: 'packageId', select: 'title packageImg pickupStart pickupEnd' })
            .sort({ createdAt: -1 })
            .exec();
    }

    async findByOrderId(orderId: string): Promise<any | null> {
        return this.cancelledOrderModel.findOne({ orderId }).exec();
    }
}