import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  public client: NodePgDatabase<typeof schema>;
  private schema = schema;

  constructor(private readonly configService: ConfigService) {
    this.pool = new Pool({
      connectionString: this.configService.get<string>('DATABASE_URL'),
    });

    this.client = drizzle(this.pool, {
      schema: this.schema,
    });
  }

  onModuleInit() {
    console.log('Database Pool initialized');
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  cleanDB() {
    return this.client.transaction(async (tx) => {
      await tx.delete(schema.Bookmark);
      await tx.delete(schema.User);
    });
  }
}
