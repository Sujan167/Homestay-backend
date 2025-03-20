import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHomestayDto, CreateRoomDto } from './dto/create-homestay.dto';
import { UpdateHomestayDto } from './dto/update-homestay.dto';
import { Role } from 'src/common/enums/roles.enum';

@Injectable()
export class HomestayService {
  private readonly logger = new Logger(HomestayService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: number,
    role: Role,
    createHomestayDto: CreateHomestayDto,
  ) {
    if (role.toUpperCase() === 'OWNER') {
      const existingHomestay = await this.prisma.homestay.findFirst({
        where: { ownerId: userId },
      });

      if (existingHomestay) {
        throw new ForbiddenException(
          'You already own a homestay. Owners can have only one homestay.',
        );
      }
    }

    const { rooms, facilities, ...homestayData } = createHomestayDto;

    const homestay = await this.prisma.homestay.create({
      data: {
        ...homestayData,
        ownerId: userId,
        ownerType: role,
      },
    });

    if (rooms && rooms.length > 0) {
      this.logger.log('Creating rooms');
      await this.prisma.room.createMany({
        data: rooms.map((room: CreateRoomDto) => ({
          ...room,
          homestayId: homestay.id,
        })),
      });
    }

    if (facilities && facilities.length > 0) {
      const facilityNames = facilities.map((facility) => facility.name);
      const existingFacilities = await this.prisma.facility.findMany({
        where: { name: { in: facilityNames } },
      });

      const existingFacilityNames = existingFacilities.map(
        (facility) => facility.name,
      );
      const newFacilities = facilities.filter(
        (facility) => !existingFacilityNames.includes(facility.name),
      );

      if (newFacilities.length > 0) {
        this.logger.log('Creating new facilities');
        await this.prisma.facility.createMany({
          data: newFacilities.map((facility) => ({ name: facility.name })),
        });
      }

      const allFacilities = await this.prisma.facility.findMany({
        where: { name: { in: facilityNames } },
      });

      const homestayFacilities = allFacilities.map((facility) => ({
        homestayId: homestay.id,
        facilityId: facility.id,
      }));

      await this.prisma.homestayFacility.createMany({
        data: homestayFacilities,
      });
    }

    return homestay;
  }

  async findMyAllHomestay(email: string, role: Role) {
    if (role == Role.SUPERUSER) {
      return await this.prisma.homestay.findMany();
    } else {
      return await this.prisma.homestay.findMany({
        where: {
          owner: {
            email,
          },
        },
      });
    }
  }

  async listAllHomestays() {
    return await this.prisma.homestay.findMany();
  }

  async findOne(id: number) {
    const homestay = await this.prisma.homestay.findUnique({
      where: { id },
    });

    if (!homestay) {
      throw new NotFoundException(`Homestay with ID ${id} not found`);
    }

    return homestay;
  }

  async update(id: number, updateHomestayDto: UpdateHomestayDto) {
    const homestay = await this.prisma.homestay.findUnique({
      where: { id },
    });

    if (!homestay) {
      throw new NotFoundException(`Homestay with ID ${id} not found`);
    }

    return await this.prisma.homestay.update({
      where: { id },
      data: updateHomestayDto,
    });
  }

  async remove(id: number) {
    const homestay = await this.prisma.homestay.findUnique({
      where: { id },
    });

    if (!homestay) {
      throw new NotFoundException(`Homestay with ID ${id} not found`);
    }

    // Delete related bookings before deleting the homestay
    await this.prisma.booking.deleteMany({
      where: {
        homestayId: homestay.id,
      },
    });

    return await this.prisma.homestay.delete({
      where: { id },
    });
  }

  async searchByLocation(location: string) {
    return await this.prisma.homestay.findMany({
      where: {
        location: {
          contains: location,
          mode: 'insensitive',
        },
      },
    });
  }
}
