import 'dotenv/config'
import path from 'node:path'
import { defineConfig, env } from 'prisma/config'

console.log('DEBUG DATABASE_URL:', process.env.DATABASE_URL)

export default defineConfig({
  engine: 'classic',
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: env('DATABASE_URL'),
  },
})
