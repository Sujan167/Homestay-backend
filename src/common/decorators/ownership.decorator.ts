import { SetMetadata } from '@nestjs/common';

export const CHECK_OWNERSHIP = 'checkOwnership';

export const CheckOwnership = (resource: string, field: string) =>
  SetMetadata(CHECK_OWNERSHIP, { resource, field });
