import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppFavoritesService } from './favorites.service';

@Controller('app/favorites')
export class AppFavoritesController {
    constructor(private readonly service: AppFavoritesService) { }

    @Post('add')
    async add(@Body() body: { userId: string; businessId: string; note?: string }) {
        try {
            const result = await this.service.addFavorite(body.userId, body.businessId, body.note);
            return { success: true, data: result, message: 'Business added to favorites' };
        } catch (err: any) {
            return { success: false, message: err.message || 'Error' };
        }
    }

    @Post('remove')
    async remove(@Body() body: { userId: string; businessId: string }) {
        try {
            const result = await this.service.removeFavorite(body.userId, body.businessId);
            return { success: true, data: result, message: 'Business removed from favorites' };
        } catch (err: any) {
            return { success: false, message: err.message || 'Error' };
        }
    }

    @Get(':userId')
    async list(@Param('userId') userId: string) {
        try {
            const result = await this.service.getUserFavorites(userId);
            return { success: true, data: result, message: 'User favorites fetched successfully' };
        } catch (err: any) {
            return { success: false, message: err.message || 'Error' };
        }
    }
}
