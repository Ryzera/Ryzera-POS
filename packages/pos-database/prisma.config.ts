import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:%23bugslayers2yrprojectPOS%23@db.dhdgmhkjstywlklyxrie.supabase.co:5432/postgres?sslmode=no-verify',
  },
  generator: {
    client: {
      provider: 'prisma-client-js',
      output: './src/generated/prisma',
    },
  },
});