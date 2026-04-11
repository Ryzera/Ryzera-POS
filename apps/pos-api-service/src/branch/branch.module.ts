import { Module } from '@nestjs/common';
import { BranchService } from './branch.service';
import { BranchController } from './branch.controller';
import { BranchRepository } from './branch.repository';

@Module({
    providers: [BranchService, BranchRepository],
    controllers: [BranchController],
    exports: [BranchService, BranchRepository],
})
export class BranchModule {}