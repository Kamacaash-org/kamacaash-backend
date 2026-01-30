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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BusinessesService } from '../../modules/businesses/businesses.service';
import { CreateOrUpdateBusinessDto } from '../../modules/businesses/dto/create-or-update-business.dto';
import { QueryBusinessDto } from '../../modules/businesses/dto/query-business.dto';
import { ToggleActiveDto } from '../../modules/businesses/dto/toggle-active.dto';
import { RejectBusinessDto } from '../../modules/businesses/dto/reject-business.dto';
import { SignContractDto } from '../../modules/businesses/dto/sign-contract.dto';
import { BusinessResponseDto } from '../../modules/businesses/dto/business-response.dto';
import { plainToClass } from 'class-transformer';

@Controller('admin/businesses')
export class BusinessesController {
  constructor(private readonly service: BusinessesService) { }

  @Get()
  async getAll(@Query() query: QueryBusinessDto): Promise<BusinessResponseDto[]> {
    const businesses = await this.service.findAll(query);
    return plainToClass(BusinessResponseDto, businesses, { excludeExtraneousValues: true });
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<BusinessResponseDto> {
    const b = await this.service.findById(id);
    if (!b) throw new HttpException('Business not found', HttpStatus.NOT_FOUND);
    return plainToClass(BusinessResponseDto, b, { excludeExtraneousValues: true });
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(
    AnyFilesInterceptor({ storage: memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }),
  )
  async createOrUpdate(@Body() body: CreateOrUpdateBusinessDto, @UploadedFiles() files?: any[]): Promise<BusinessResponseDto> {
    try {
      // Nest's AnyFilesInterceptor returns array; convert to map by fieldname
      const filesMap: any = {};
      (files || []).forEach((f: any) => {
        filesMap[f.fieldname] = filesMap[f.fieldname] || [];
        filesMap[f.fieldname].push(f);
      });

      const business = await this.service.createOrUpdate(body, filesMap);
      return plainToClass(BusinessResponseDto, business, { excludeExtraneousValues: true });
    } catch (err: any) {
      throw new HttpException(err.message || 'Failed', err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/archive')
  async archive(@Param('id') id: string): Promise<BusinessResponseDto> {
    const business = await this.service.archive(id);
    return plainToClass(BusinessResponseDto, business, { excludeExtraneousValues: true });
  }

  @Post(':id/active')
  @UsePipes(new ValidationPipe({ transform: true }))
  async toggleActive(@Param('id') id: string, @Body() body: ToggleActiveDto): Promise<BusinessResponseDto> {
    const business = await this.service.toggleActive(id, body.isActive);
    return plainToClass(BusinessResponseDto, business, { excludeExtraneousValues: true });
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string): Promise<BusinessResponseDto> {
    const business = await this.service.approve(id);
    return plainToClass(BusinessResponseDto, business, { excludeExtraneousValues: true });
  }

  @Post(':id/reject')
  @UsePipes(new ValidationPipe({ transform: true }))
  async reject(@Param('id') id: string, @Body() body: RejectBusinessDto): Promise<BusinessResponseDto> {
    const business = await this.service.reject(id, body.rejectionReason);
    return plainToClass(BusinessResponseDto, business, { excludeExtraneousValues: true });
  }

  @Post('sign-contract')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(
    FileInterceptor('agreementPdf', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async signContract(@Body() body: SignContractDto, @UploadedFile() file?: any): Promise<BusinessResponseDto> {
    try {
      const { _id } = body;
      const business = await this.service.signContract(_id, file);
      return plainToClass(BusinessResponseDto, business, { excludeExtraneousValues: true });
    } catch (err: any) {
      throw new HttpException(err.message || 'Failed', err.status || HttpStatus.BAD_REQUEST);
    }
  }
}
