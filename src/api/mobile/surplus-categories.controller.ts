import { Controller, Get } from '@nestjs/common';
import { SurplusCategoriesService } from 'src/modules/surplus-categories/surplus-categories.service';

@Controller('app/surplus-categories')
export class AppSurplusCategoriesController {
    constructor(private readonly service: SurplusCategoriesService) { }

    @Get()
    async getsurpluscategories() {
        const categories = await this.service.findActive();
        return { success: true, data: { categories } };
    }
}
