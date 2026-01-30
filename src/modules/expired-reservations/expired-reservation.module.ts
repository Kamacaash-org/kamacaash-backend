import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ExpiredReservation, ExpiredReservationSchema } from './schemas/expired-reservation.schema';
import { ExpiredService } from './expired-reservation.service';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: ExpiredReservation.name, schema: ExpiredReservationSchema }]),
  ],
  providers: [ExpiredService],
  exports: [ExpiredService, MongooseModule],
})
export class ExpiredReservationModule { }
