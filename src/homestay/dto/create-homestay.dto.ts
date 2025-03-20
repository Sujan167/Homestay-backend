import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/common/enums/roles.enum';
export class CreateHomestayDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  location: string;
  @ApiProperty()
  ownerId: number;
  @ApiProperty()
  totalCapacity: number;
  @ApiProperty()
  ownerType: Role;
  @ApiProperty()
  totalBooked?: number;
  @ApiProperty()
  checkIn: Date;
  @ApiProperty()
  checkOut: Date;
  @ApiProperty()
  images?: string[];
  @ApiProperty()
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  @ApiProperty()
  communityHomestayId?: number;
  @ApiProperty()
  rooms: CreateRoomDto[];
  @ApiProperty()
  facilities: CreateFacilityDto[];
}

export class CreateRoomDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  price: number;
  @ApiProperty()
  adults: number;
  @ApiProperty()
  children?: number;
  @ApiProperty()
  totalPeople: number;
  @ApiProperty()
  images?: string[];
  @ApiProperty()
  status?: 'AVAILABLE' | 'BOOKED';
  @ApiProperty()
  homestayId: number;
}

export class CreateFacilityDto {
  @ApiProperty()
  name: string;
}
