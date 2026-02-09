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
  Req,
  Put,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
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
import { ConfigService } from '@nestjs/config';
import * as qs from 'qs';
import { EditBusinessSettingsDto } from 'src/modules/businesses/dto/editBusinessSettings.dto';

@Controller('admin/businesses')
export class BusinessesController {
  constructor(
    private readonly service: BusinessesService,
    private readonly configService: ConfigService,
  ) { }

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
  @UseInterceptors(
    AnyFilesInterceptor({ storage: memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }),
  )
  async createOrUpdate(
    @Req() req: any,
    @UploadedFiles() files?: any[],
  ): Promise<ApiResponse<BusinessResponseDto>> {
    try {
      // Nest's AnyFilesInterceptor returns array; convert to map by fieldname
      const filesMap: any = {};
      (files || []).forEach((f: any) => {
        filesMap[f.fieldname] = filesMap[f.fieldname] || [];
        filesMap[f.fieldname].push(f);
      });

      // Parse FormData into proper nested structure using qs
      const data = qs.parse(req.body);

      // Ensure data is plain objects (not [Object: null prototype])
      const cleanData = JSON.parse(JSON.stringify(data));

      console.log('Parsed data:', JSON.stringify(cleanData, null, 2));

      const business = await this.service.createOrUpdate(cleanData, filesMap);
      const responseData = plainToInstance(BusinessResponseDto, business, {
        excludeExtraneousValues: true,
      });

      // Add agreement data for PDF generation on frontend
      if (!data._id) { // Only for new businesses
        const appConfig = this.configService.get('app');
        (responseData as any).agreementData = {
          businessName: business.businessName,
          ownerName: business.ownerName,
          email: business.email,
          phone: `${business.countryCode} ${business.phoneNumber}`,
          category: business.category,
          description: business.description,
          registrationNumber: business.registrationNumber,
          taxId: business.taxId,
          commissionRate: appConfig.business.commissionRate,
          currency: appConfig.business.currency,
          defaultLanguage: appConfig.business.defaultLanguage,
          timeZone: appConfig.business.timeZone,
          payoutSchedule: business.contract.payoutSchedule,
          agreementReference: business._id,
          date: new Date().toISOString().split('T')[0]
        };
      }

      return new ApiResponse(201, responseData, MESSAGES.BUSINESS.CREATE_OR_UPDATE);
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


  @Get('profile/:id')
  async getBusinessProfile(@Param('id') businessId: string) {
    const business = await this.service.getBusinessProfile(businessId);

    const data = plainToInstance(BusinessResponseDto, business, {
      excludeExtraneousValues: true,
    });

    return new ApiResponse(200, data, MESSAGES.BUSINESS.FETCH_PROFILE);
  }

  @Put('updateProfile/:id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'logo', maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 },
    { name: 'licenseDocument', maxCount: 1 },
  ]))
  async editBusinessSettings(
    @Param('id') businessId: string,
    @Body() payload: EditBusinessSettingsDto,
    @UploadedFiles() files: { logo?: Express.Multer.File[]; bannerImage?: Express.Multer.File[]; licenseDocument?: Express.Multer.File[] },
  ): Promise<ApiResponse<BusinessResponseDto>> {
    const business = await this.service.editBusinessSettings(businessId, payload, files);

    const data = plainToInstance(BusinessResponseDto, business, {
      excludeExtraneousValues: true,
    });

    return new ApiResponse(200, data, MESSAGES.BUSINESS.UPDATED_SETTINGS);
  }
}
