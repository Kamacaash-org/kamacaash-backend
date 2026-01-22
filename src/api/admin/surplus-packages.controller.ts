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

@Controller('admin/surplus-packages')
export class SurplusPackagesController {
    constructor(private readonly service: SurplusPackagesService) { }

    @Get()
    async findAll(@Query() query: any) {
        return this.service.findAll(query);
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
    ) {
        try {
            return await this.service.createOrUpdate(body as any, file);
        } catch (err: any) {
            throw new HttpException(err.message || 'Failed', HttpStatus.BAD_REQUEST);
        }
    }

    @Delete(':id')
    async softDelete(@Param('id') id: string) {
        return this.service.softDelete(id);
    }

    @Delete(':id/hard')
    async hardDelete(@Param('id') id: string) {
        return this.service.hardDelete(id);
    }
}
