import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SurplusCategoriesService } from '../../modules/surplus-categories/surplus-categories.service';
import { CreateSurplusCategoryDto } from '../../modules/surplus-categories/dto/create-surplus-category.dto';
import { UpdateSurplusCategoryDto } from '../../modules/surplus-categories/dto/update-surplus-category.dto';
import { ApiResponse } from '../../utils/response.util';
import { MESSAGES } from '../../constants/messages';

@Controller('admin/surplus-categories')
export class SurplusCategoriesController {
  constructor(private readonly service: SurplusCategoriesService) {}

  @Get()
  async getAll(): Promise<ApiResponse<any>> {
    const categories = await this.service.findAll();
    return new ApiResponse(200, { categories }, MESSAGES.SURPLUS_CATEGORY.GET_ALL);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<ApiResponse<any>> {
    const category = await this.service.findById(id);
    return new ApiResponse(
      200,
      { category },
      MESSAGES.SURPLUS_CATEGORY.GET_BY_ID || 'Surplus category retrieved successfully',
    );
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() dto: CreateSurplusCategoryDto): Promise<ApiResponse<any>> {
    const category = await this.service.create(dto);
    return new ApiResponse(201, { category }, MESSAGES.SURPLUS_CATEGORY.CREATE);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSurplusCategoryDto,
  ): Promise<ApiResponse<any>> {
    const category = await this.service.update(id, dto);
    return new ApiResponse(200, { category }, MESSAGES.SURPLUS_CATEGORY.UPDATE);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<ApiResponse<any>> {
    await this.service.remove(id);
    return new ApiResponse(200, null, MESSAGES.SURPLUS_CATEGORY.DELETE);
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string): Promise<ApiResponse<any>> {
    const category = await this.service.activate(id);
    return new ApiResponse(200, { category }, MESSAGES.SURPLUS_CATEGORY.ACTIVATE);
  }
}
