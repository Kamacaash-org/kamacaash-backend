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
import { plainToInstance } from 'class-transformer';
import { ApiResponse } from '../../utils/response.util';
import { MESSAGES } from '../../constants/messages';

@Controller('admin/businesses')
export class BusinessesController {
  constructor(private readonly service: BusinessesService) {}

  @Get()
  async getAll(@Query() query: QueryBusinessDto): Promise<ApiResponse<BusinessResponseDto[]>> {
    const businesses = await this.service.findAll(query);
    const data = plainToInstance(BusinessResponseDto, businesses, {
      excludeExtraneousValues: true,
    });
    return new ApiResponse(200, data, MESSAGES.BUSINESS.GET_ALL);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<ApiResponse<BusinessResponseDto>> {
    const b = await this.service.findById(id);
    if (!b) throw new HttpException('Business not found', HttpStatus.NOT_FOUND);
    const data = plainToInstance(BusinessResponseDto, b, { excludeExtraneousValues: true });
    return new ApiResponse(200, data, MESSAGES.BUSINESS.GET_BY_ID);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(
    AnyFilesInterceptor({ storage: memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }),
  )
  async createOrUpdate(
    @Body() body: CreateOrUpdateBusinessDto,
    @UploadedFiles() files?: any[],
  ): Promise<ApiResponse<BusinessResponseDto>> {
    try {
      // Nest's AnyFilesInterceptor returns array; convert to map by fieldname
      const filesMap: any = {};
      (files || []).forEach((f: any) => {
        filesMap[f.fieldname] = filesMap[f.fieldname] || [];
        filesMap[f.fieldname].push(f);
      });

      const business = await this.service.createOrUpdate(body, filesMap);
      const data = plainToInstance(BusinessResponseDto, business, {
        excludeExtraneousValues: true,
      });
      return new ApiResponse(201, data, MESSAGES.BUSINESS.CREATE_OR_UPDATE);
    } catch (err: any) {
      throw new HttpException(err.message || 'Failed', err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/archive')
  async archive(@Param('id') id: string): Promise<ApiResponse<BusinessResponseDto>> {
    const business = await this.service.archive(id);
    const data = plainToInstance(BusinessResponseDto, business, { excludeExtraneousValues: true });
    return new ApiResponse(200, data, MESSAGES.BUSINESS.ARCHIVE);
  }

  @Post(':id/active')
  @UsePipes(new ValidationPipe({ transform: true }))
  async toggleActive(
    @Param('id') id: string,
    @Body() body: ToggleActiveDto,
  ): Promise<ApiResponse<BusinessResponseDto>> {
    const business = await this.service.toggleActive(id, body.isActive);
    const data = plainToInstance(BusinessResponseDto, business, { excludeExtraneousValues: true });
    return new ApiResponse(200, data, MESSAGES.BUSINESS.TOGGLE_ACTIVE);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string): Promise<ApiResponse<BusinessResponseDto>> {
    const business = await this.service.approve(id);
    const data = plainToInstance(BusinessResponseDto, business, { excludeExtraneousValues: true });
    return new ApiResponse(200, data, MESSAGES.BUSINESS.APPROVE);
  }

  @Post(':id/reject')
  @UsePipes(new ValidationPipe({ transform: true }))
  async reject(
    @Param('id') id: string,
    @Body() body: RejectBusinessDto,
  ): Promise<ApiResponse<BusinessResponseDto>> {
    const business = await this.service.reject(id, body.rejectionReason);
    const data = plainToInstance(BusinessResponseDto, business, { excludeExtraneousValues: true });
    return new ApiResponse(200, data, MESSAGES.BUSINESS.REJECT);
  }

  @Post('sign-contract')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(
    FileInterceptor('agreementPdf', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async signContract(
    @Body() body: SignContractDto,
    @UploadedFile() file?: any,
  ): Promise<ApiResponse<BusinessResponseDto>> {
    try {
      const { _id } = body;
      const business = await this.service.signContract(_id, file);
      const data = plainToInstance(BusinessResponseDto, business, {
        excludeExtraneousValues: true,
      });
      return new ApiResponse(200, data, MESSAGES.BUSINESS.SIGN_CONTRACT);
    } catch (err: any) {
      throw new HttpException(err.message || 'Failed', err.status || HttpStatus.BAD_REQUEST);
    }
  }
}
