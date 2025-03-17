import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';

import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.createUser(createUserDto);
  }

  @Get()
  async findAll(): Promise<User[]> {
    const users = await this.userService.getAllUsers();
    if (!Array.isArray(users)) {
      throw new Error('Unexpected response type');
    }
    return users;
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<User | null> {
    return await this.userService.getUserById(Number(id));
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.userService.updateUser(Number(id), updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<User> {
    return await this.userService.deleteUser(Number(id));
  }
}
