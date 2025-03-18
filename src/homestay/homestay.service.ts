import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateHomestayDto,
  CreateRoomDto,
  CreateFacilityDto,
} from './dto/create-homestay.dto';
import { UpdateHomestayDto } from './dto/update-homestay.dto';
import { Role } from 'src/common/enums/roles.enum';

@Injectable()
export class HomestayService {
  private readonly logger = new Logger(HomestayService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: number,
    role: string,
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

  findAll(email: string, role: Role) {
    if (role == Role.SUPERUSER) {
      return this.prisma.homestay.findMany();
    } else {
      return this.prisma.homestay.findMany({
        where: {
          owner: {
            email,
          },
        },
      });
    }
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

    return this.prisma.homestay.update({
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

    return this.prisma.homestay.delete({
      where: { id },
    });
  }
}
