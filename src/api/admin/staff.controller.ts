import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { StaffService } from '../../modules/staff/staff.service';
import { CreateStaffDto } from '../../modules/staff/dto/create-staff.dto';
import { UpdateStaffDto } from '../../modules/staff/dto/update-staff.dto';
import { StaffResponseDto } from '../../modules/staff/dto/staff-response.dto';
import { plainToInstance } from 'class-transformer';
import { ApiResponse } from '../../utils/response.util';
import { MESSAGES } from '../../constants/messages';
import { ChangePasswordDto } from 'src/modules/staff/dto/change-password.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('admin/staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) { }

  @Get()
  async getAll(): Promise<ApiResponse<StaffResponseDto[]>> {
    const staffList = await this.staffService.findAll();
    const data = plainToInstance(StaffResponseDto, staffList, {
      excludeExtraneousValues: true,
    });
    return new ApiResponse(200, data, MESSAGES.STAFF.GET_ALL);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() dto: CreateStaffDto): Promise<ApiResponse<StaffResponseDto>> {
    try {
      const staff = await this.staffService.create(dto);
      const data = plainToInstance(StaffResponseDto, staff, { excludeExtraneousValues: true });
      return new ApiResponse(201, data, MESSAGES.STAFF.CREATE);
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to create staff',
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
  ): Promise<ApiResponse<StaffResponseDto>> {
    try {
      const staff = await this.staffService.update(id, dto);
      const data = plainToInstance(StaffResponseDto, staff, { excludeExtraneousValues: true });
      return new ApiResponse(200, data, MESSAGES.STAFF.UPDATE);
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to update staff',
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<ApiResponse<any>> {
    try {
      await this.staffService.softDelete(id);
      return new ApiResponse(200, null, MESSAGES.STAFF.DELETE);
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to delete staff',
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }


  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async changePassword(
    @Req() req: any,
    @Body() dto: ChangePasswordDto,
  ): Promise<ApiResponse<any>> {
    try {
      const staffId = req.user.sub; // from JWT

      const result = await this.staffService.changePassword(
        staffId,
        dto.currentPassword,
        dto.newPassword,
      );

      return new ApiResponse(200, null, 'Password changed successfully');
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to change password',
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
