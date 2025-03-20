import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Logger,
  Request,
  Query,
} from '@nestjs/common';
import { HomestayService } from './homestay.service';
import { CreateHomestayDto } from './dto/create-homestay.dto';
import { UpdateHomestayDto } from './dto/update-homestay.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@Controller('homestay')
@ApiTags('Homestay')
@ApiBearerAuth('jwt')
export class HomestayController {
  private readonly logger = new Logger(HomestayController.name);
  constructor(private readonly homestayService: HomestayService) {}

  @Post()
  @ApiOperation({
    summary: 'Create New homestay',
    description: 'This endpoint creates new homestay. Owner can create only one homestay and community_owner can create multiple homestays',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.COMMUNITY_OWNER, Role.SUPERUSER)
  async create(
    @Request() req: { user: { id: number; email: string; role: Role } },
    @Body() createHomestayDto: CreateHomestayDto,
  ) {
    const { id, role } = req.user;
    this.logger.log('Creating homestay');
    return await this.homestayService.create(id, role, createHomestayDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all homestay of the owner/community_owner', // Short description
    description:
      'This endpoint lists all the homestay of owner or community_owner',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.COMMUNITY_OWNER, Role.SUPERUSER)
  async findMyAllHomestay(
    @Request() req: { user: { email: string; role: Role } },
  ) {
    const { email, role } = req.user;
    this.logger.log('Finding my homestays');
    return await this.homestayService.findMyAllHomestay(email, role);
  }

  @Get('list-all')
  @ApiOperation({
    summary: 'List all available homestay to the Guest',
    description: 'This endpoint lists all available homestays to the guest',
  })
  async listAllHomestays() {
    this.logger.log('List all homestays');
    return await this.homestayService.listAllHomestays();
  }

  @Get('search')
  @ApiOperation({
    summary: 'Searches homestay by location', // Short description
    description: 'This endpoint searches a homestay by location',
  })
  async searchByLocation(@Query('location') location: string) {
    this.logger.log(`Searching homestays in location: ${location}`);
    return await this.homestayService.searchByLocation(location);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Homestay by ID', // Short description
    description: 'This endpoint gets details of homestay by ID',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.COMMUNITY_OWNER, Role.SUPERUSER)
  async findOne(@Param('id') id: string) {
    this.logger.log('Finding one homestay');
    return await this.homestayService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a homestay by ID', // Short description
    description: 'This endpoint update a homestay details',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.COMMUNITY_OWNER, Role.SUPERUSER)
  async update(
    @Param('id') id: string,
    @Body() updateHomestayDto: UpdateHomestayDto,
  ) {
    this.logger.log('Updating homestay');
    return await this.homestayService.update(+id, updateHomestayDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a homestay by ID', // Short description
    description:
      'This endpoint deletes a homestay along with all its related bookings.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.COMMUNITY_OWNER, Role.SUPERUSER)
  async remove(@Param('id') id: string) {
    this.logger.log('Removing homestay');
    return await this.homestayService.remove(+id);
  }
}
