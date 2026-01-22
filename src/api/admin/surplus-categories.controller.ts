import { Body, Controller, Get, Param, Post, Put, Delete, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { SurplusCategoriesService } from '../../modules/surplus-categories/surplus-categories.service';
import { CreateSurplusCategoryDto } from '../../modules/surplus-categories/dto/create-surplus-category.dto';
import { UpdateSurplusCategoryDto } from '../../modules/surplus-categories/dto/update-surplus-category.dto';

@Controller('admin/surplus-categories')
export class SurplusCategoriesController {
    constructor(private readonly service: SurplusCategoriesService) { }

    @Get()
    async getAll() {
        const categories = await this.service.findAll();
        return { categories };
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
        const category = await this.service.findById(id);
        return { category };
    }

    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    async create(@Body() dto: CreateSurplusCategoryDto) {
        const category = await this.service.create(dto);
        return { category };
    }

    @Put(':id')
    @UsePipes(new ValidationPipe({ transform: true }))
    async update(@Param('id') id: string, @Body() dto: UpdateSurplusCategoryDto) {
        const category = await this.service.update(id, dto);
        return { category };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string) {
        await this.service.remove(id);
        return { message: 'Category deactivated successfully' };
    }

    @Post(':id/activate')
    async activate(@Param('id') id: string) {
        const category = await this.service.activate(id);
        return { category };
    }
}
