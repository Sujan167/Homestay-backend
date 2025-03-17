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
} from '@nestjs/common';
import { User } from '@prisma/client';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user ${createUserDto.email}`);
    return await this.userService.createUser(createUserDto);
  }

  @Get()
  @Roles(Role.SUPERUSER)
  async findAll(): Promise<User[]> {
    this.logger.log('Fetching all users');
    const users = await this.userService.getAllUsers();
    if (!Array.isArray(users)) {
      throw new Error('Unexpected response type');
    }
    return users;
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<User | null> {
    this.logger.log(`Fetching user with id ${id}`);
    return await this.userService.getUserById(Number(id));
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    this.logger.log(`Updating user with id ${id}`);
    return await this.userService.updateUser(Number(id), updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<User> {
    this.logger.log(`Deleting user with id ${id}`);
    return await this.userService.deleteUser(Number(id));
  }
}
