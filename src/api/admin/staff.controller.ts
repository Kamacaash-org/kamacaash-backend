import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { StaffService } from '../../modules/staff/staff.service';

@Controller('admin/staff')
export class StaffController {
    constructor(private readonly staffService: StaffService) { }

    @Get()
    async getAll() {
        return this.staffService.findAll();
    }

    @Post()
    async create(@Body() body: any) {
        try {
            const staff = await this.staffService.create(body);
            return staff;
        } catch (err: any) {
            throw new HttpException(err.message || 'Failed to create staff', err.status || HttpStatus.BAD_REQUEST);
        }
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        try {
            return await this.staffService.update(id, body);
        } catch (err: any) {
            throw new HttpException(err.message || 'Failed to update staff', err.status || HttpStatus.BAD_REQUEST);
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        try {
            return await this.staffService.softDelete(id);
        } catch (err: any) {
            throw new HttpException(err.message || 'Failed to delete staff', err.status || HttpStatus.BAD_REQUEST);
        }
    }
}
