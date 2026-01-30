import { Controller, Get } from '@nestjs/common';
import { SurplusCategoriesService } from 'src/modules/surplus-categories/surplus-categories.service';
import { ApiResponse } from '../../utils/response.util';
import { MESSAGES } from '../../constants/messages';

@Controller('app/surplus-categories')
export class AppSurplusCategoriesController {
  constructor(private readonly service: SurplusCategoriesService) {}

  @Get()
  async getsurpluscategories(): Promise<ApiResponse<any>> {
    const categories = await this.service.findActive();
    return new ApiResponse(200, { categories }, MESSAGES.SURPLUS_CATEGORY.GET_ALL);
  }
}
