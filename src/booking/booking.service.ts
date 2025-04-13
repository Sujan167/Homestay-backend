import { EmailService } from 'src/email/email.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { VerificationStatus } from 'src/common/enums/verificationStatus.enum';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async createBooking(userId: number, data: CreateBookingDto) {
    // Get homestay details
    const homestay = await this.prisma.homestay.findUnique({
      where: { id: data.homestayId },
      select: { totalCapacity: true, totalBooked: true }, // Select only necessary fields
    });

    if (!homestay) {
      throw new NotFoundException('Homestay not found');
    }

    // Calculate available space
    const availableCapacity = homestay.totalCapacity - homestay.totalBooked;

    if (data.totalPeople > availableCapacity) {
      throw new BadRequestException(
        `Only ${availableCapacity} spots left. Cannot accommodate ${data.totalPeople} guests.`,
      );
    }

    // Create the booking
    const booking = await this.prisma.booking.create({
      data: {
        ...data,
        // status: 'PENDING', // Default status
        guestId: userId,
      },
    });

    // Update the total booked count
    await this.prisma.homestay.update({
      where: { id: data.homestayId },
      data: {
        totalBooked: {
          increment: data.totalPeople,
        },
        // homestay.totalBooked + data.totalPeople, // Increase booked count
      },
    });

    return booking;
  }

  async findAll(ownerId: number) {
    return await this.prisma.booking.findMany({
      where: {
        homestay: {
          ownerId: ownerId, // Fetch bookings for homestays owned by this owner
        },
      },
      include: {
        homestay: true, // Include homestay details
        guest: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phoneNumber: true,
            address: true,
            verificationStatus: true,
            profilePicture: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.booking.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdateBookingDto) {
    return this.prisma.booking.update({ where: { id }, data });
  }

  async remove(id: number) {
    // Fetch the booking details first
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      select: {
        homestayId: true,
        totalPeople: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Delete the booking
    await this.prisma.booking.delete({
      where: { id },
    });

    // Update the homestay capacity by restoring the removed booking's people count
    return this.prisma.homestay.update({
      where: { id: booking.homestayId },
      data: {
        totalBooked: {
          decrement: booking.totalPeople, // Restore the capacity
        },
      },
    });
  }

  async verifyBooking(id: number, updateBookingDto: UpdateBookingDto) {
    // Fetch the booking details along with guest details
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      select: {
        status: true, // Only need to check the status
        homestay: { select: { name: true } }, // Get homestay name
        checkIn: true, // Get check-in date
        guest: { select: { email: true, name: true } }, // Get guest details
      },
    });

    // If booking is not found, throw an error
    if (!booking) {
      throw new Error('Booking not found');
    }

    // If booking is already canceled, prevent further updates
    if (booking.status === VerificationStatus.CANCELED) {
      throw new Error('Cannot update status. Booking is already canceled');
    }

    // Update the booking status
    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: updateBookingDto.status, // Should be "APPROVED" or "REJECTED"
      },
    });

    // Send email notification only if the booking is approved
    if (updateBookingDto.status === VerificationStatus.APPROVED) {
      console.log(booking.guest);
      // await this.emailService.sendEmail(
      //   booking.guest.email,
      //   'Booking Confirmation',
      //   'booking-confirmation',
      //   {
      //     name: booking.guest.name,
      //     homestayName: booking.homestay.name,
      //     date: booking.checkIn.toISOString().split('T')[0], // Format date
      //     bookingLink: `https://yourapp.com/bookings/${id}`,
      //   },
      // );
      await this.emailService.sendEmailSMTP(
        booking.guest.email,
        'Booking Confirmation',
        `Hello ${booking.guest.name}, your booking for ${booking.homestay.name} on ${booking.checkIn.toISOString().split('T')[0]} has been approved. Visit https://yourapp.com/bookings/${id} for more details.`,
      );
    }

    return updatedBooking;
  }

  // async cancelBooking(bookingId: number, cancellationReason: string) {
  //   return await this.prisma.$transaction(async (prisma) => {
  //     // Get the booking details
  //     const booking = await prisma.booking.findUnique({
  //       where: { id: bookingId },
  //       select: {
  //         id: true,
  //         homestayId: true,
  //         totalPeople: true,
  //         status: true,
  //       },
  //     });

  //     if (!booking) {
  //       throw new Error('Booking not found');
  //     }

  //     if (booking.status === VerificationStatus.CANCELED) {
  //       throw new Error('Booking is already canceled');
  //     }

  //     // Cancel the booking
  //     await prisma.booking.update({
  //       where: { id: bookingId },
  //       data: {
  //         canceledAt: new Date(),
  //         cancellationReason,
  //         status: 'CANCELED',
  //       },
  //     });

  //     // Check if any active bookings exist for this homestay
  //     const activeBookings = await prisma.booking.count({
  //       where: {
  //         homestayId: booking.homestayId,
  //         status: { not: 'CANCELED' }, // Count only active bookings
  //       },
  //     });

  //     // Update the totalBooked for the homestay by subtracting the totalPeople from the canceled booking
  //     await prisma.homestay.update({
  //       where: { id: booking.homestayId },
  //       data: {
  //         totalBooked: {
  //           decrement: booking.totalPeople, // Decrease totalBooked by the number of people in the canceled booking
  //         },
  //       },
  //     });

  //     if (activeBookings === 0) {
  //       // If no active bookings, mark the room as AVAILABLE
  //       await prisma.room.updateMany({
  //         where: { homestayId: booking.homestayId },
  //         data: { status: 'AVAILABLE' },
  //       });
  //     }

  //     return { message: 'Booking canceled, room availability updated' };
  //   });
  // }

  async cancelBooking(bookingId: number, cancellationReason: string) {
    return await this.prisma.$transaction(async (prisma) => {
      // Get the booking details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: {
          id: true,
          homestayId: true,
          totalPeople: true,
          status: true,
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status === 'CANCELED') {
        throw new Error('Booking is already canceled');
      }

      // Get the homestay owner details
      const homestay = await prisma.homestay.findUnique({
        where: { id: booking.homestayId },
        select: {
          owner: {
            select: {
              email: true,
              name: true,
            },
          },
          name: true, // Get homestay name for email
        },
      });

      if (!homestay || !homestay.owner) {
        throw new Error('Homestay owner not found');
      }

      // Cancel the booking
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          canceledAt: new Date(),
          cancellationReason,
          status: 'CANCELED',
        },
      });

      // Check if any active bookings exist for this homestay
      const activeBookings = await prisma.booking.count({
        where: {
          homestayId: booking.homestayId,
          status: { not: 'CANCELED' },
        },
      });

      // Update the totalBooked for the homestay
      await prisma.homestay.update({
        where: { id: booking.homestayId },
        data: {
          totalBooked: {
            decrement: booking.totalPeople,
          },
        },
      });

      if (activeBookings === 0) {
        // If no active bookings, mark the room as AVAILABLE
        await prisma.room.updateMany({
          where: { homestayId: booking.homestayId },
          data: { status: 'AVAILABLE' },
        });
      }

      // ✅ Send email to homestay owner
      await this.emailService.sendEmailSMTP(
        homestay.owner.email,
        `Booking Cancellation - ${homestay.name}`,
        `A booking for ${homestay.name} has been canceled. Reason: ${cancellationReason}`,
        `<h2>Booking Cancellation</h2>
         <p>Hello ${homestay.owner.name},</p>
         <p>A guest has canceled their booking for <strong>${homestay.name}</strong>.</p>
         <p><strong>Reason:</strong> ${cancellationReason}</p>
         <p>Please check your dashboard for more details.</p>`,
      );

      return { message: 'Booking canceled, owner notified via email' };
    });
  }
}
