import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
// import { HomestayService } from './homestay/homestay.service';
// import { BookingService } from './booking/booking.service';
import { PrismaModule } from './prisma/prisma.module';
import { BookingModule } from './booking/booking.module';
// import { HomestayModule } from './homestay/homestay.module';

@Module({
  imports: [UserModule, AuthModule, PrismaModule, BookingModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
