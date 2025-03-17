export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: 'GUEST' | 'OWNER' | 'COMMUNITY_OWNER' | 'SUPERUSER';
  verificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}
