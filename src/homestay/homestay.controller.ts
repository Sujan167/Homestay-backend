import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { HomestayService } from './homestay.service';
import { CreateHomestayDto } from './dto/create-homestay.dto';
import { UpdateHomestayDto } from './dto/update-homestay.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
@Controller('homestay')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class HomestayController {
  constructor(private readonly homestayService: HomestayService) {}

  @Post()
  create(@Body() createHomestayDto: CreateHomestayDto) {
    return this.homestayService.create(createHomestayDto);
  }

  @Get()
  // @Roles(Role.OWNER, Role.COMMUNITY_OWNER, Role.SUPERUSER)
  findAll() {
    return this.homestayService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.homestayService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHomestayDto: UpdateHomestayDto,
  ) {
    return this.homestayService.update(+id, updateHomestayDto);
  }

  @Delete(':id')
  @Roles(Role.SUPERUSER)
  remove(@Param('id') id: string) {
    return this.homestayService.remove(+id);
  }
}
