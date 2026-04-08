import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { MockAuthModule } from './mock-auth/mock-auth.module';
import { BranchModule } from './branch/branch.module';

@Module({
  imports: [PrismaModule, MockAuthModule, BranchModule],
})
export class AppModule {}