import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(data: CreateBookingDto) {
    return this.prisma.booking.create({ data });
  }

  async findAll() {
    return this.prisma.booking.findMany();
  }

  async findOne(id: number) {
    return this.prisma.booking.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdateBookingDto) {
    return this.prisma.booking.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.booking.delete({ where: { id } });
  }
}
