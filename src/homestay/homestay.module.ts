import { Module } from '@nestjs/common';
import { HomestayService } from './homestay.service';
import { HomestayController } from './homestay.controller';

@Module({
  controllers: [HomestayController],
  providers: [HomestayService],
})
export class HomestayModule {}
