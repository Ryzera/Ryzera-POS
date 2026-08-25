import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UsersRepository } from '../users/users.repository';
import { UserLogRepository } from '../users/user-log.repository';
import { TokenBlacklistService } from './token-blacklist.service';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'ryzera_secret_key',
            signOptions: { expiresIn: '8h' },
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        JwtAuthGuard,
        RolesGuard,
        UsersRepository,
        UserLogRepository,
        TokenBlacklistService,
    ],
    exports: [
        AuthService,
        JwtModule,
        PassportModule,
        JwtAuthGuard,
        RolesGuard,
        TokenBlacklistService,
    ],
})
export class AuthModule {}