import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // Called when the module is initialized
  async onModuleInit() {
    // Connect to the database (Prisma automatically handles connection pooling)
    await this.$connect();
  }

  // Called when the module is destroyed
  async onModuleDestroy() {
    // Disconnect from the database, releasing the pooled connections
    await this.$disconnect();
  }
}
