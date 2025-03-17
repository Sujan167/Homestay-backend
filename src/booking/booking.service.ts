import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  create(createBookingDto: CreateBookingDto) {
    return 'This action adds a new booking';
  }

  findAll() {
    return `This action returns all booking`;
  }

  findOne(id: number) {
    return `This action returns a #${id} booking`;
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  remove(id: number) {
    return `This action removes a #${id} booking`;
  }
}
// import { Injectable } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';

// @Injectable()
// export class BookingService {
//   constructor(private prisma: PrismaService) {}

//   // Guest requests booking for a homestay
//   async requestBooking(guestId: number, homestayId: number) {
//     const guest = await this.prisma.user.findUnique({
//       where: { id: guestId },
//     });

//     if (!guest || guest.role !== 'GUEST') {
//       throw new Error('User must be a guest to request booking');
//     }

//     const bookingRequest = await this.prisma.bookingRequest.create({
//       data: {
//         guestId: guestId,
//         homestayId: homestayId,
//         status: BookingRequestStatus.PENDING,
//       },
//     });

//     return bookingRequest;
//   }

//   // Owner or community owner approves/rejects booking request
//   async updateBookingRequestStatus(
//     bookingRequestId: number,
//     status: BookingRequestStatus,
//   ) {
//     const bookingRequest = await this.prisma.bookingRequest.update({
//       where: { id: bookingRequestId },
//       data: { status: status },
//     });

//     return bookingRequest;
//   }
// }
