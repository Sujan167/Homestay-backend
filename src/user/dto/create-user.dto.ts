import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  role?: 'GUEST' | 'OWNER' | 'COMMUNITY_OWNER' | 'SUPERUSER';
  @ApiProperty()
  verificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}
