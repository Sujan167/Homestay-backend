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
} from '@nestjs/common';
import { HomestayService } from './homestay.service';
import { CreateHomestayDto } from './dto/create-homestay.dto';
import { UpdateHomestayDto } from './dto/update-homestay.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@Controller('homestay')
@ApiTags('Homestay')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HomestayController {
  private readonly logger = new Logger(HomestayController.name);
  constructor(private readonly homestayService: HomestayService) {}

  @Post()
  @Roles(Role.OWNER, Role.COMMUNITY_OWNER, Role.SUPERUSER)
  create(
    @Request() req: { user: { userId: number; email: string; role: Role } },
    @Body() createHomestayDto: CreateHomestayDto,
  ) {
    const { userId, role } = req.user;
    this.logger.log('Creating homestay');
    return this.homestayService.create(userId, role, createHomestayDto);
  }

  @Get()
  @Roles(Role.OWNER, Role.COMMUNITY_OWNER, Role.SUPERUSER)
  findAll(@Request() req: { user: { email: string; role: Role } }) {
    const { email, role } = req.user;
    this.logger.log('Finding all homestays');
    return this.homestayService.findAll(email, role);
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.COMMUNITY_OWNER, Role.SUPERUSER)
  findOne(@Param('id') id: string) {
    this.logger.log('Finding one homestay');
    return this.homestayService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.COMMUNITY_OWNER, Role.SUPERUSER)
  update(
    @Param('id') id: string,
    @Body() updateHomestayDto: UpdateHomestayDto,
  ) {
    this.logger.log('Updating homestay');
    return this.homestayService.update(+id, updateHomestayDto);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.COMMUNITY_OWNER, Role.SUPERUSER)
  remove(@Param('id') id: string) {
    this.logger.log('Removing homestay');
    return this.homestayService.remove(+id);
  }
}
