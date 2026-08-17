import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env file explicitly load
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export default defineConfig({
  earlyAccess: true,
  schema: './prisma/schema.prisma',
  migrate: {
    async adapter() {
      const { PrismaPg } = await import('@prisma/adapter-pg');
      const { default: pg } = await import('pg');

      const connectionString = process.env.DATABASE_URL;
      console.log('Connecting to:', connectionString?.substring(0, 50) + '...');

      const isLocalDb = connectionString?.includes('localhost') || connectionString?.includes('127.0.0.1');
      const pool = new pg.Pool({
        connectionString,
        ssl: isLocalDb ? false : { rejectUnauthorized: false },
      });
      return new PrismaPg(pool);
    },
  },
});