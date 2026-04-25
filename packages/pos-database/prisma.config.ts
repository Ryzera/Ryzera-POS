import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    db: {
      url: 'postgresql://postgres:postgres@localhost:5432/ryzera_pos?schema=public',
    },
  },
});