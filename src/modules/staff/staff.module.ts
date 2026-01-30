import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Staff, StaffSchema } from './schemas/staff.schema';
import { StaffService } from './staff.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: Staff.name, schema: StaffSchema }])],
    providers: [StaffService],
    exports: [StaffService],
})
export class StaffModule { }
