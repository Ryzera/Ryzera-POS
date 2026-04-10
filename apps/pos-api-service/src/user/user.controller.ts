import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private user: UserService) {}

  @Get() findAll() {
    return this.user.findAll();
  }
  @Get(':id') findOne(@Param('id') id: string) {
    return this.user.findOne(id);
  }

  @Patch(':id/branch')
  assignBranch(
    @Param('id') id: string,
    @Body('branchId') branchId: string | null,
  ) {
    return this.user.assignBranch(id, branchId);
  }
}
