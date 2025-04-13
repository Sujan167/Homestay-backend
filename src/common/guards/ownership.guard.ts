import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';

// Define user roles
type Role = 'GUEST' | 'OWNER' | 'COMMUNITY_OWNER' | 'SUPERUSER';

interface AuthenticatedUser {
  id: number;
  role: Role;
}

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser;
    const entityId = Number(request.params.id);

    if (!user || !entityId) {
      throw new ForbiddenException('Unauthorized');
    }

    const entityName = this.reflector.get<string>(
      'entity',
      context.getHandler(),
    );
    console.log(`Entity metadata retrieved: ${entityName}`); // Debug log

    if (!entityName) {
      throw new ForbiddenException('Ownership configuration is missing.');
    }

    if (!(entityName in this.prisma)) {
      throw new ForbiddenException(
        `Entity '${entityName}' does not exist in PrismaService.`,
      );
    }

    // Fetch entity dynamically
    const entity = await (this.prisma[entityName] as any).findUnique({
      where: { id: entityId },
    });

    if (!entity) {
      throw new ForbiddenException(`${entityName} not found`);
    }

    // Ownership rules
    if (user.role === 'SUPERUSER') return true; // Superuser has full access

    switch (entityName) {
      case 'homestay':
        // Owners & Community Owners can access only their own homestays
        if (
          (user.role === 'OWNER' || user.role === 'COMMUNITY_OWNER') &&
          entity.ownerId === user.id
        )
          return true;
        break;

      case 'room':
        // Owners & Community Owners can access rooms of their own homestay
        const homestay = await this.prisma.homestay.findUnique({
          where: { id: entity.homestayId },
        });

        if (homestay && homestay.ownerId === user.id) return true;
        break;

      case 'booking':
        // Guests can only access their own bookings
        if (user.role === 'GUEST' && entity.guestId === user.id) {
          console.log('Access granted: Guest owns the booking');
          return true;
        }

        // Owners & Community Owners should access bookings of their own homestay
        if (user.role === 'OWNER' || user.role === 'COMMUNITY_OWNER') {
          if (!entity.homestayId) {
            throw new ForbiddenException('Invalid booking data');
          }

          const homestay = await this.prisma.homestay.findUnique({
            where: { id: entity.homestayId },
          });

          if (homestay && homestay.ownerId === user.id) {
            console.log(
              'Access granted: Owner/Community Owner owns the homestay',
            );
            return true;
          }
        }

        throw new ForbiddenException('You do not have permission.');
    }

    throw new ForbiddenException('You do not have permission.');
  }
}
