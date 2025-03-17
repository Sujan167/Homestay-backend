import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HomestayService } from './homestay.service';
import { CreateHomestayDto } from './dto/create-homestay.dto';
import { UpdateHomestayDto } from './dto/update-homestay.dto';

@Controller('homestay')
export class HomestayController {
  constructor(private readonly homestayService: HomestayService) {}

  @Post()
  create(@Body() createHomestayDto: CreateHomestayDto) {
    return this.homestayService.create(createHomestayDto);
  }

  @Get()
  findAll() {
    return this.homestayService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.homestayService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHomestayDto: UpdateHomestayDto) {
    return this.homestayService.update(+id, updateHomestayDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.homestayService.remove(+id);
  }
}
