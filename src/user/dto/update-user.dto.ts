import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateUserDto {
  @ApiProperty()
  name?: string;
  @ApiProperty()
  email?: string;
  @ApiProperty()
  password?: string;
  @ApiProperty()
  role?: 'GUEST' | 'OWNER' | 'COMMUNITY_OWNER' | 'SUPERUSER';
  @ApiProperty()
  verificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}
