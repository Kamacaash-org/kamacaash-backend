import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    Query,
    UploadedFile,
    UseInterceptors,
    UploadedFiles,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BusinessesService } from '../../modules/businesses/businesses.service';

@Controller('admin/businesses')
export class BusinessesController {
    constructor(private readonly service: BusinessesService) { }

    @Get()
    async getAll(@Query() query: any) {
        return this.service.findAll(query);
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
        const b = await this.service.findById(id);
        if (!b) throw new HttpException('Business not found', HttpStatus.NOT_FOUND);
        return b;
    }

    @Post()
    @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }))
    async createOrUpdate(@Body() body: any, @UploadedFiles() files?: any[]) {
        try {
            // Nest's AnyFilesInterceptor returns array; convert to map by fieldname
            const filesMap: any = {};
            (files || []).forEach((f: any) => {
                filesMap[f.fieldname] = filesMap[f.fieldname] || [];
                filesMap[f.fieldname].push(f);
            });

            return await this.service.createOrUpdate(body, filesMap);
        } catch (err: any) {
            throw new HttpException(err.message || 'Failed', err.status || HttpStatus.BAD_REQUEST);
        }
    }

    @Post(':id/archive')
    async archive(@Param('id') id: string) {
        return this.service.archive(id);
    }

    @Post(':id/active')
    async toggleActive(@Param('id') id: string, @Body() body: any) {
        return this.service.toggleActive(id, body.isActive);
    }

    @Post(':id/approve')
    async approve(@Param('id') id: string) {
        return this.service.approve(id);
    }

    @Post(':id/reject')
    async reject(@Param('id') id: string, @Body() body: any) {
        return this.service.reject(id, body.rejectionReason);
    }

    @Post('sign-contract')
    @UseInterceptors(FileInterceptor('agreementPdf', { storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }))
    async signContract(@Body() body: any, @UploadedFile() file?: any) {
        try {
            const { _id } = body;
            return await this.service.signContract(_id, file);
        } catch (err: any) {
            throw new HttpException(err.message || 'Failed', err.status || HttpStatus.BAD_REQUEST);
        }
    }
}
