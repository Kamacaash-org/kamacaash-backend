import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SurplusPackagesService } from '../../modules/surplus-packages/surplus-packages.service';
import { CreateSurplusPackageDto } from '../../modules/surplus-packages/dto/create-surplus-package.dto';
import { ApiResponse } from '../../utils/response.util';
import { MESSAGES } from '../../constants/messages';

@Controller('admin/surplus-packages')
export class SurplusPackagesController {
  constructor(private readonly service: SurplusPackagesService) {}

  @Get()
  async findAll(@Query() query: any): Promise<ApiResponse<any>> {
    const data = await this.service.findAll(query);
    return new ApiResponse(200, data, MESSAGES.SURPLUS_PACKAGE.GET_ALL);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('packageImg', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async createOrUpdate(
    @Body() body: CreateSurplusPackageDto,
    @UploadedFile() file?: any,
  ): Promise<ApiResponse<any>> {
    try {
      const data = await this.service.createOrUpdate(body as any, file);
      return new ApiResponse(
        201,
        data,
        MESSAGES.SURPLUS_PACKAGE.CREATE_OR_UPDATE || 'Surplus package created/updated successfully',
      );
    } catch (err: any) {
      throw new HttpException(err.message || 'Failed', HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async softDelete(@Param('id') id: string): Promise<ApiResponse<any>> {
    const data = await this.service.softDelete(id);
    return new ApiResponse(200, data, MESSAGES.SURPLUS_PACKAGE.DELETE);
  }

  @Delete(':id/hard')
  async hardDelete(@Param('id') id: string): Promise<ApiResponse<any>> {
    const data = await this.service.hardDelete(id);
    return new ApiResponse(200, data, MESSAGES.SURPLUS_PACKAGE.DELETE);
  }
}
