import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private tokenBlacklistService: TokenBlacklistService,
    ) {}

    async register(dto: RegisterDto) {
        const existing = await this.prisma.user.findUnique({
            where: { username: dto.username },
        });
        if (existing) throw new ConflictException('Username already exists');

        const role = await this.prisma.role.findUnique({
            where: { name: dto.role ?? 'CASHIER' },
        });
        if (!role) throw new BadRequestException(`Role not found`);

        const hashedPassword = await bcrypt.hash(dto.password, 12);

        const user = await this.prisma.user.create({
            data: {
                username: dto.username,
                password: hashedPassword,
                company_id: dto.company_id,
                branch_id: dto.branch_id,
                user_type: dto.user_type ?? 'STAFF',
                status: 'ACTIVE',
                info: {
                    create: {
                        first_name: dto.firstName,
                        last_name: dto.lastName,
                        email: dto.email,
                        phone: dto.phone,
                    },
                },
                userRoles: {
                    create: { roleId: role.id },
                },
            },
            include: { info: true, userRoles: { include: { role: true } } },
        });

        const { password, ...result } = user;
        return result;
    }

    async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
        const user = await this.prisma.user.findUnique({
            where: { username: dto.username },
            include: {
                userRoles: { include: { role: true } },
                info: true,
            },
        });

        if (!user || user.status !== 'ACTIVE') {
            await this.logAction(user?.user_id, user?.branch_id, 'LOGIN', 'FAILED', ipAddress, userAgent);
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            await this.logAction(user.user_id, user.branch_id, 'LOGIN', 'FAILED', ipAddress, userAgent);
            throw new UnauthorizedException('Invalid credentials');
        }

        await this.logAction(user.user_id, user.branch_id, 'LOGIN', 'SUCCESS', ipAddress, userAgent);

        await this.prisma.user.update({
            where: { user_id: user.user_id },
            data: { last_login_at: new Date() },
        });

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

    async logout(userId: number, token?: string, ipAddress?: string, userAgent?: string) {
        if (token) {
            this.tokenBlacklistService.blacklist(token);
        }
        const user = await this.prisma.user.findUnique({
            where: { user_id: userId },
        });
        if (user) {
            await this.logAction(userId, user.branch_id, 'LOGOUT', 'SUCCESS', ipAddress, userAgent);
        }
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
        branchId: number | undefined,
        action: string,
        status: string,
        ipAddress?: string,
        userAgent?: string,
    ) {
        if (!userId || !branchId) return;
        await this.prisma.userLog.create({
            data: {
                userId,
                branch_id: branchId,
                action,
                status,
                ipAddress,
                device_info: userAgent,
            },
        });
    }
}