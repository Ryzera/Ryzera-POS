import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UserLogRepository } from './user-log.repository';

@Module({
    controllers: [UsersController],
    providers: [UsersService, UsersRepository, UserLogRepository],
    exports: [UsersService, UsersRepository, UserLogRepository],
})
export class UsersModule {}