import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MockAuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async login(username: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { username },
            include: {
                userRoles: {
                    include: { role: true },
                },
            },
        });

        if (!user) throw new UnauthorizedException('User not found');

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new UnauthorizedException('Wrong password');

        const role = user.userRoles[0]?.role?.name ?? 'CASHIER';

        const payload = {
            sub:      user.user_id,
            username: user.username,
            role:     role,
            branchId: user.branch_id,
        };

        return {
            access_token: this.jwtService.sign(payload),
            role,
            branchId: user.branch_id,
            username: user.username,
        };
    }
}