import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MockAuthController } from './mock-auth.controller';
import { MockAuthService } from './mock-auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [
        PrismaModule,
        PassportModule,
        JwtModule.register({
            secret: 'ryzera-pos-secret-2024',
            signOptions: { expiresIn: '8h' },
        }),
    ],
    controllers: [MockAuthController],
    providers: [MockAuthService, JwtStrategy],
    exports: [JwtModule],
})
export class MockAuthModule {}