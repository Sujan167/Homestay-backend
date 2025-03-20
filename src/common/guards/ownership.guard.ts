import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';
import { Role } from '@prisma/client'; // Import Role Enum from Prisma

interface User {
  id: number;
  role: Role;
}

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User; // Explicitly cast user to User type
    const bookingId = Number(request.params.id);

    if (!user || !user.id || !user.role || !bookingId) {
      throw new ForbiddenException('Unauthorized');
    }

    // Fetch booking with homestay details
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { homestay: true },
    });

    if (!booking) {
      throw new ForbiddenException('Booking not found');
    }

    // Check ownership based on role
    if (user.role === 'GUEST' && booking.guestId === user.id) {
      return true; // Guests can cancel their own booking
    }

    if (
      (user.role === 'OWNER' || user.role === 'COMMUNITY_OWNER') &&
      booking.homestay.ownerId === user.id
    ) {
      return true; // Owners and Community Owners can cancel their own homestay bookings
    }

    if (user.role === 'SUPERUSER') {
      return true; // Superuser has full access
    }

    throw new ForbiddenException(
      'You do not have permission to cancel this booking',
    );
  }
}
