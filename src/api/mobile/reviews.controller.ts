import { Body, Controller, Post } from '@nestjs/common';
import { AppReviewsService } from '../../app-mobile/reviews.service';

@Controller('app/reviews')
export class AppReviewsController {
    constructor(private readonly service: AppReviewsService) { }

    @Post('business')
    async reviewBusiness(@Body() body: { userId: string; businessId: string; orderId?: string; rating: number; comment?: string }) {
        try {
            const result = await this.service.reviewBusiness(body);
            return { success: true, data: result };
        } catch (err: any) {
            return { success: false, message: err.message || 'Error' };
        }
    }
}
