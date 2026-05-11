import { Module } from '@nestjs/common';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { BranchRepository } from './branch.repository';

@Module({
    controllers: [BranchController],
    providers: [BranchService, BranchRepository],
    exports: [BranchService, BranchRepository],
})
export class BranchModule {}