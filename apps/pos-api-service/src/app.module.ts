import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { MockAuthModule } from './mock-auth/mock-auth.module';

@Module({
  imports: [PrismaModule, MockAuthModule],
})
export class AppModule {}