import { Body, Controller, Get, Param, Post, HttpException, HttpStatus } from '@nestjs/common';
import { FavoritesService } from '../../modules/favorites/favorites.service';
import { ApiResponse } from '../../utils/response.util';
import { MESSAGES } from '../../constants/messages';

@Controller('app/favorites')
export class AppFavoritesController {
  constructor(private readonly service: FavoritesService) {}

  @Post('add')
  async add(
    @Body() body: { userId: string; businessId: string; note?: string },
  ): Promise<ApiResponse<any>> {
    try {
      const result = await this.service.addFavorite(body.userId, body.businessId, body.note);
      return new ApiResponse(201, result, MESSAGES.FAVORITE.ADD);
    } catch (err: any) {
      throw new HttpException(err.message || 'Error', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('remove')
  async remove(@Body() body: { userId: string; businessId: string }): Promise<ApiResponse<any>> {
    try {
      const result = await this.service.removeFavorite(body.userId, body.businessId);
      return new ApiResponse(200, result, MESSAGES.FAVORITE.REMOVE);
    } catch (err: any) {
      throw new HttpException(err.message || 'Error', HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':userId')
  async list(@Param('userId') userId: string): Promise<ApiResponse<any>> {
    try {
      const result = await this.service.getUserFavorites(userId);
      return new ApiResponse(200, result, MESSAGES.FAVORITE.GET_ALL);
    } catch (err: any) {
      throw new HttpException(err.message || 'Error', HttpStatus.BAD_REQUEST);
    }
  }
}
