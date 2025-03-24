import { SetMetadata } from '@nestjs/common';

export const CheckOwnership = (options: {
  entity: string;
  userField: string;
}) => SetMetadata('entity', options.entity);
