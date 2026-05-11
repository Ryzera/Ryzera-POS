import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: 'postgresql://postgres:postgres@localhost:5432/ryzera_pos?schema=public',
  },
  generator: {
    client: {
      provider: 'prisma-client-js',
      output: './src/generated/prisma',
    },
  },
});