import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { BookingModule } from './booking/booking.module';
import { HomestayModule } from './homestay/homestay.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    PrismaModule,
    BookingModule,
    HomestayModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
