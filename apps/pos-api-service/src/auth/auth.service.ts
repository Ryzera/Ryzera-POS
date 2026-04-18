import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {
    }

    async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {

        // Find user
        const user = await this.prisma.user.findUnique({
            where: {username: dto.username},
            include: {
                userRoles: {include: {role: true}},
                info: true,
            },
        });

        // Validate user
        if (!user || user.status !== 'ACTIVE') {
            await this.logAction(user?.user_id, 'LOGIN', 'FAILED', ipAddress, userAgent);
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            await this.logAction(user.user_id, 'LOGIN', 'FAILED', ipAddress, userAgent);
            throw new UnauthorizedException('Invalid credentials');
        }
        // Log success
        await this.logAction(user.user_id, 'LOGIN', 'SUCCESS', ipAddress, userAgent);

        // Update last login
        await this.prisma.user.update({
            where: { user_id: user.user_id },
            data: { last_login_at: new Date() },
        });

        // Generate JWT
        const roles = user.userRoles.map((ur) => ur.role.name);
        const token = this.jwtService.sign({
            sub: user.user_id,
            username: user.username,
            roles,
        });

        return {
            accessToken: token,
            user: {
                id: user.user_id,
                username: user.username,
                roles,
                firstName: user.info?.first_name,
                lastName: user.info?.last_name,
            },
        };
    }

    async logout(userId: number, ipAddress?: string, userAgent?: string) {
        await this.logAction(userId, 'LOGOUT', 'SUCCESS', ipAddress, userAgent);
        return { message: 'Logged out successfully' };
    }

    async getProfile(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { user_id: userId },
            include: {
                info: true,
                userRoles: {
                    include: {
                        role: {
                            include: {
                                roleAuthorities: { include: { authority: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!user) throw new UnauthorizedException();

        return {
            id: user.user_id,
            username: user.username,
            status: user.status,
            roles: user.userRoles.map((ur) => ur.role.name),
            authorities: user.userRoles.flatMap((ur) =>
                ur.role.roleAuthorities.map((ra) => ra.authority.name),
            ),
            info: user.info,
        };
    }

    private async logAction(
        userId: number | undefined,
        action: string,
        status: string,
        ipAddress?: string,
        userAgent?: string,
    ) {
        if (!userId) return;
        await this.prisma.userLog.create({
            data: {
                userId,
                branch_id: 1,
                action,
                status,
                ipAddress: ipAddress,
                device_info: userAgent,
            },
        });
    }
}