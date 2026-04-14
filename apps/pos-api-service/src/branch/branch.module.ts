import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module'; // adjust path if needed

import { BranchController } from './branch.controller';
import { BranchRepository } from './branch.repository';
import { BranchService } from './branch.service';

@Module({
    imports: [PrismaModule], // 👈 add this
    controllers: [BranchController],
    exports: [BranchService, BranchRepository],
    providers: [BranchService, BranchRepository],
})
export class BranchModule {}