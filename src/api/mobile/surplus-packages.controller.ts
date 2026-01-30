import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { SurplusPackagesService } from 'src/modules/surplus-packages/surplus-packages.service';
import { ApiResponse } from '../../utils/response.util';
import { MESSAGES } from '../../constants/messages';

@Controller('app/surplus-packages')
export class AppSurplusPackagesController {
  constructor(private readonly service: SurplusPackagesService) {}

  @Get()
  async list(): Promise<ApiResponse<any>> {
    const data = await this.service.getSurplusPackagesForList();
    return new ApiResponse(200, data, MESSAGES.SURPLUS_PACKAGE.GET_ALL);
  }

  @Get(':packageId')
  async detail(@Param('packageId') packageId: string): Promise<ApiResponse<any>> {
    try {
      const data = await this.service.getSurplusPackageDetail(packageId);
      return new ApiResponse(200, data, MESSAGES.SURPLUS_PACKAGE.GET_BY_ID);
    } catch (err: any) {
      throw new HttpException(err.message || 'Not found', HttpStatus.NOT_FOUND);
    }
  }
}
