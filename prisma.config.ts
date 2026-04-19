import { defineConfig } from 'prisma/config'
import * as dotenv from 'dotenv'

dotenv.config({ path: 'packages/pos-database/.env' })

export default defineConfig({
    schema: 'packages/pos-database/prisma/schema.prisma',
    datasource: {
        url: process.env.DATABASE_URL!,
    },
})
