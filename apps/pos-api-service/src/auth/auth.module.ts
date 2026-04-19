import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret:      process.env.JWT_SECRET ?? 'changeme',
            signOptions: { expiresIn: '7d' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, AuthRepository, JwtStrategy, JwtAuthGuard, RolesGuard],
    exports: [JwtAuthGuard, RolesGuard, AuthService],
})
export class AuthModule {}