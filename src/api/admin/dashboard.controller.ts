import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { DashboardService } from 'src/modules/dashboard/dashboard.service';
import { MESSAGES } from 'src/constants/messages';
import { ApiResponse } from 'src/utils/response.util';

@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  async getOverview(): Promise<ApiResponse<any>> {
    try {
      const data = await this.dashboardService.getAdminDashboardOverview();
      return new ApiResponse(200, data, MESSAGES.DASHBOARD.GET_OVERVIEW);
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to fetch dashboard overview',
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
