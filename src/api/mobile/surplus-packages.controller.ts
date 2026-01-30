import { Controller, Get, Param } from '@nestjs/common';
import { SurplusPackagesService } from 'src/modules/surplus-packages/surplus-packages.service';

@Controller('app/surplus-packages')
export class AppSurplusPackagesController {
  constructor(private readonly service: SurplusPackagesService) {}

  @Get()
  async list() {
    const data = await this.service.getSurplusPackagesForList();
    return { success: true, data };
  }

  @Get(':packageId')
  async detail(@Param('packageId') packageId: string) {
    try {
      const data = await this.service.getSurplusPackageDetail(packageId);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, message: err.message || 'Not found' };
    }
  }
}
