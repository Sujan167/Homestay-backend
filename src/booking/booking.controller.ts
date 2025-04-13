import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Request,
  Delete,
  UseGuards,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { CheckOwnership } from 'src/common/decorators/ownership.decorator';
import { OwnershipGuard } from 'src/common/guards/ownership.guard';
@Controller('bookings')
@ApiTags('Booking')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  private readonly logger = new Logger(BookingController.name);
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({
    summary: 'Guest create homestay booking', // Short description
    description: 'This endpoint Creates homestay booking',
  })
  @Roles(Role.GUEST, Role.OWNER, Role.COMMUNITY_OWNER, Role.SUPERUSER)
  create(
    @Request() req: { user: { id: number; email: string } },
    @Body() createBookingDto: CreateBookingDto,
  ) {
    console.log('In create booking', req.user);
    const { id } = req.user;
    this.logger.log(`Creating Booking for: ${req.user.email}`);
    return this.bookingService.createBooking(id, createBookingDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all booking by owner or community_owner', // Short description
    description: 'This endpoint list booking by owner or community_owner',
  })
  @Roles(Role.OWNER, Role.COMMUNITY_OWNER, Role.SUPERUSER)
  @CheckOwnership({ entity: 'booking', userField: 'ownerId' })
  findMyAllBookings(
    @Request() req: { user: { id: number; email: string; role: Role } },
  ) {
    const { id, email, role } = req.user;
    this.logger.log(`List all bookings of role-${role} of email-${email}`);
    return this.bookingService.findAll(id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get details of booking by bookingId', // Short description
    description: 'This endpoint details of booking by bookingId',
  })
  @UseGuards(OwnershipGuard)
  @CheckOwnership({ entity: 'booking', userField: 'guestId' })
  async findOne(@Param('id') id: string, @Request() req) {
    const booking = await this.bookingService.findOne(+id);

    if (!booking) {
      this.logger.warn(`Booking with ID ${id} not found`);

      throw new ForbiddenException('Booking not found');
    }

    // If the user is a guest, only allow access to their own booking
    // if (booking.guestId !== req.user.id || req.user.role == Role.GUEST) {
    //   throw new ForbiddenException(
    //     'You can only view your own bookings or those you have permission for',
    //   );
    // }
    this.logger.log(
      `User with ID ${req.user.id} successfully accessed booking with ID ${id}`,
    );

    return booking;
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update booking by Guest', // Short description
    description: 'This endpoint Update booking by Guest',
  })
  @UseGuards(OwnershipGuard)
  @CheckOwnership({ entity: 'booking', userField: 'guestId' })
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Request() req,
  ) {
    const booking = await this.bookingService.findOne(+id);

    if (!booking) {
      this.logger.warn(`Booking with ID ${id} not found`);

      throw new ForbiddenException('Booking not found');
    }

    // If the user is a guest, only allow them to update their own booking
    if (req.user.role == Role.GUEST && booking.guestId !== req.user.id) {
      this.logger.warn(
        `Guest with ID ${req.user.id} tried to update booking with ID ${id}, but it belongs to someone else`,
      );
      throw new ForbiddenException(
        'You can only update your own bookings or those you have permission for',
      );
    }
    this.logger.log(`Booking with ID ${id} is being updated`);
    return this.bookingService.update(+id, updateBookingDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete booking by owner or community_owner', // Short description
    description:
      'This endpoint delets booking by owner or community_owner based on booking Id',
  })
  @UseGuards(OwnershipGuard)
  @CheckOwnership({ entity: 'booking', userField: 'ownerId' })
  async remove(@Param('id') id: string, @Request() req) {
    const booking = await this.bookingService.findOne(+id);

    if (!booking) {
      this.logger.log(`Booking for id: ${id} not found`);
      throw new ForbiddenException('Booking not found');
    }

    // If the user is a guest, only allow them to delete their own booking
    if (req.user.role == Role.GUEST && booking.guestId !== req.user.id) {
      throw new ForbiddenException(
        'You can only delete your own bookings or those you have permission for',
      );
    }
    this.logger.log(`User: ${req.user.id} delete booking with id: ${id}`);
    return this.bookingService.remove(+id);
  }

  @Patch('verify-booking/:id')
  @ApiOperation({
    summary: 'Approve or reject booking by owner or community_owner', // Short description
    description:
      'This endpoint Approve or reject booking by owner or community_owner',
  })
  @UseGuards(OwnershipGuard)
  @Roles(Role.OWNER, Role.COMMUNITY_OWNER, Role.SUPERUSER)
  @CheckOwnership({ entity: 'booking', userField: 'ownerId' })
  async verifyBooking(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Request() req,
  ) {
    this.logger.log(
      `VerifyBooking by user: ${req.user.id} of role: ${req.user.role} in booking ${id}`,
    );
    return this.bookingService.verifyBooking(+id, updateBookingDto);
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Guest cancel the homestay by booking ID',
    description: 'This endpoint Cancels the booking by booking ID',
  })
  @CheckOwnership({ entity: 'booking', userField: 'guestId' })
  @UseGuards(OwnershipGuard)
  @Roles(Role.GUEST, Role.COMMUNITY_OWNER, Role.SUPERUSER)
  async cancelBooking(
    @Param('id') id: string,
    @Body('cancellationReason') cancellationReason: string,
    @Request() req,
  ) {
    this.logger.log(
      `Cancellation of booking by user: ${req.user.id}in id: ${id}`,
    );
    return await this.bookingService.cancelBooking(
      Number(id),
      cancellationReason,
    );
  }
}
