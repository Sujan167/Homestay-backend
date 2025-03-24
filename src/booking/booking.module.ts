import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { AuthModule } from 'src/auth/auth.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [AuthModule, EmailModule],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
