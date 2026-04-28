// ============================================================
// Lookup Module
// File: apps/pos-api-service/src/lookup/lookup.module.ts
// ============================================================

import { Module }          from '@nestjs/common';
import { LookupController } from './lookup.controller';
import { PrismaModule }    from '../prisma/prisma.module';

@Module({
    imports:     [PrismaModule],
    controllers: [LookupController],
})
export class LookupModule {}