export class CreateAuthDto {
  email: string;
  password: string;
  name: string;
  role: 'GUEST' | 'OWNER' | 'COMMUNITY_OWNER' | 'SUPERUSER';
}
