import { Module } from '@nestjs/common';
import { HomestayService } from './homestay.service';
import { HomestayController } from './homestay.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [HomestayController],
  providers: [HomestayService, PrismaService],
})
export class HomestayModule {}
