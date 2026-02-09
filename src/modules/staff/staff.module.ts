import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Staff, StaffSchema } from './schemas/staff.schema';
import { StaffService } from './staff.service';
import { BusinessesModule } from '../businesses/businesses.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Staff.name, schema: StaffSchema }]),
    BusinessesModule
  ],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule { }
