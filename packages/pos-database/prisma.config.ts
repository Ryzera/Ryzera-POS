<<<<<<< HEAD
import path from 'node:path';
import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
    schema: path.join(__dirname, 'prisma/schema.prisma'),
    datasource: {
        url: process.env.DATABASE_URL!,
    },
=======
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
>>>>>>> 8491ae3 (Auth module and updated schema.prisma(Added 2 user roles))
});