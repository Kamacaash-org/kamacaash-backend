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
} from '@nestjs/common';
import { StaffService } from '../../modules/staff/staff.service';
import { CreateStaffDto } from '../../modules/staff/dto/create-staff.dto';
import { UpdateStaffDto } from '../../modules/staff/dto/update-staff.dto';
import { StaffResponseDto } from '../../modules/staff/dto/staff-response.dto';
import { plainToClass } from 'class-transformer';

@Controller('admin/staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) { }

  @Get()
  async getAll(): Promise<StaffResponseDto[]> {
    const staffList = await this.staffService.findAll();
    return plainToClass(StaffResponseDto, staffList, { excludeExtraneousValues: true });
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() dto: CreateStaffDto): Promise<StaffResponseDto> {
    try {
      const staff = await this.staffService.create(dto);
      return plainToClass(StaffResponseDto, staff, { excludeExtraneousValues: true });
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to create staff',
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() dto: UpdateStaffDto): Promise<StaffResponseDto> {
    try {
      const staff = await this.staffService.update(id, dto);
      return plainToClass(StaffResponseDto, staff, { excludeExtraneousValues: true });
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to update staff',
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.staffService.softDelete(id);
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Failed to delete staff',
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
