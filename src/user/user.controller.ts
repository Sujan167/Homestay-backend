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
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@Controller('user')
@ApiTags('User')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new user',
    description: 'This endpoint creates new user in the system.',
  })
  @Roles(Role.GUEST, Role.OWNER, Role.COMMUNITY_OWNER, Role.SUPERUSER)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user ${createUserDto.email}`);
    return await this.userService.createUser(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all users for SuperUser',
    description: 'This endpoint lists all users for superuser only',
  })
  @Roles(Role.SUPERUSER)
  async findAll(): Promise<User[]> {
    this.logger.log('Successfully fetched all users');
    return await this.userService.getAllUsers();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'list user based on Id',
    description: 'This endpoint list user based on Id.',
  })
  @Roles(Role.GUEST, Role.OWNER, Role.COMMUNITY_OWNER, Role.SUPERUSER)
  async findOne(@Param('id') id: number): Promise<User | null> {
    this.logger.log(`Fetching user with id ${id}`);
    return await this.userService.getUserById(Number(id));
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user details',
    description: 'This endpoint Updates user details.',
  })
  @Roles(Role.GUEST, Role.OWNER, Role.COMMUNITY_OWNER, Role.SUPERUSER)
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    this.logger.log(`Updating user with id ${id}`);
    return await this.userService.updateUser(Number(id), updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user',
    description: 'This endpoint deletes user in the system.',
  })
  @Roles(Role.SUPERUSER)
  async remove(@Param('id') id: number): Promise<User> {
    this.logger.log(`Deleting user with id ${id}`);
    return await this.userService.deleteUser(Number(id));
  }
}
