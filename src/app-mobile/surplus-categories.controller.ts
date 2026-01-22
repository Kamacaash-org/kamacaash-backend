import { Controller, Get } from '@nestjs/common';
import { AppSurplusCategoriesService } from './surplus-categories.service';

@Controller('app/surplus-categories')
export class AppSurplusCategoriesController {
    constructor(private readonly service: AppSurplusCategoriesService) { }

    @Get()
    async getsurpluscategories() {
        const categories = await this.service.findActive();
        return { success: true, data: { categories } };
    }
}
