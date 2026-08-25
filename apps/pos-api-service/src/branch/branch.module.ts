import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { BranchRepository } from './branch.repository';

@Module({
    imports: [PrismaModule],
    controllers: [BranchController],
    providers: [BranchService, BranchRepository],
    exports: [BranchService],
})
export class BranchModule {}