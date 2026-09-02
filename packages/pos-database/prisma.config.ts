import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

if (!process.env.DATABASE_URL) {
  throw new Error(
      'DATABASE_URL environment variable is not set. Please define it in your .env file.',
  );
}

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});