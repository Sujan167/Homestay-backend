import { ApiProperty } from '@nestjs/swagger';
export class CreateBookingDto {
  @ApiProperty()
  homestayId: number;
  @ApiProperty()
  guestId: number;
  @ApiProperty()
  checkIn: Date;
  @ApiProperty()
  checkOut: Date;
  @ApiProperty()
  adults: number;
  @ApiProperty()
  children?: number;
  @ApiProperty()
  totalPeople: number;
  @ApiProperty()
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}
