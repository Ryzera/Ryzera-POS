import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ReturnsModule } from './returns/returns.module';

@Module({
  imports: [PrismaModule, ReturnsModule],
})
export class AppModule {}