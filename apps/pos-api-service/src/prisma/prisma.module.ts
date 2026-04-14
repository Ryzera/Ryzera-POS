import { Global, Module } from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';

@Global()
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule {}