import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../users/users.repository';
import { UserLogRepository } from '../users/user-log.repository';
import { LoginDto, ChangePasswordDto, JwtPayload } from '@ryzera/pos-schema';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly userLogRepository: UserLogRepository,
        private readonly jwtService: JwtService,
        private readonly tokenBlacklistService: TokenBlacklistService,
    ) {}

    //  Login
    async login(dto: LoginDto, ip?: string, userAgent?: string) {
        // 1. User find
        const user = await this.usersRepository.findByUsername(dto.username);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 2. Account locked check
        if (user.account_locked_until && user.account_locked_until > new Date()) {
            const minutesLeft = Math.ceil(
                (user.account_locked_until.getTime() - Date.now()) / 60000,
            );
            throw new ForbiddenException(
                `Account locked. Try again in ${minutesLeft} minutes`,
            );
        }

        // 3. Status check
        if (user.status === 'INACTIVE') {
            throw new ForbiddenException('Account is inactive. Contact admin');
        }

        // 4. Password verify
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            // Failed attempt track කරන්න
            const attempts = (user.failed_login_attempts || 0) + 1;
            await this.usersRepository.updateLoginFailed(user.id, attempts);

            // Log failed attempt
            await this.userLogRepository.create({
                userId: user.id,
                branch_id: user.branch_id ?? undefined,
                action: 'LOGIN',
                status: 'FAILED',
                ip_address: ip,
                user_agent: userAgent,
            });

            const remaining = 5 - attempts;
            if (remaining > 0) {
                throw new UnauthorizedException(
                    `Invalid credentials. ${remaining} attempts remaining`,
                );
            } else {
                throw new ForbiddenException(
                    'Account locked for 30 minutes due to too many failed attempts',
                );
            }
        }

        // 5. Login success — reset failed attempts
        await this.usersRepository.updateLoginSuccess(user.id);

        // 6. Extract roles
        const roles = user.userRoles.map((ur) => ur.role.name);

        // 6b. NEW — Extract authorities (flattened + deduped across all of the user's roles)
        // Requires usersRepository.findByUsername() to include:
        //   userRoles: { include: { role: { include: { authorities: { include: { authority: true } } } } } }
        const authorities: string[] = Array.from(
            new Set<string>(
                user.userRoles.flatMap((ur) =>
                    (ur.role.authorities ?? []).map((ra: any) => ra.authority.name as string),
                ),
            ),
        );

        // 7. Build JWT payload
        const payload: JwtPayload = {
            userId: user.id,
            companyId: user.company_id,
            branchId: user.branch_id ?? null,
            roles,
            authorities, // NEW — also add `authorities: string[]` to the JwtPayload type in @ryzera/pos-schema
            userType: user.user_type,
        };

        // 8. Generate token
        const token = this.jwtService.sign(payload);

        // 9. Log success
        await this.userLogRepository.create({
            userId: user.id,
            branch_id: user.branch_id ?? undefined,
            action: 'LOGIN',
            status: 'SUCCESS',
            ip_address: ip,
            user_agent: userAgent,
        });

        // 10. Return response
        return {
            access_token: token,
            user: {
                id: user.id,
                username: user.username,
                user_type: user.user_type,
                company_id: user.company_id,
                branch_id: user.branch_id,
                roles,
                authorities, // NEW — frontend auth.store.ts reads this into User.authorities
                info: user.info,
            },
        };
    }

    // ─── Get Profile ──────────────────────────────────────
    async getProfile(userId: number) {
        const user = await this.usersRepository.findById(userId);
        if (!user) throw new UnauthorizedException('User not found');

        const { password, ...safeUser } = user;
        return safeUser;
    }

    // ─── Change Password ─────────────────────────────────
    async changePassword(userId: number, dto: ChangePasswordDto) {
        const user = await this.usersRepository.findById(userId);
        if (!user) throw new UnauthorizedException('User not found');

        // Current password verify
        const isValid = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
        await this.usersRepository.updatePassword(userId, hashedPassword);

        // Log password change
        await this.userLogRepository.create({
            userId,
            branch_id: user.branch_id ?? undefined,
            action: 'PASSWORD_CHANGED',
            status: 'SUCCESS',
        });

        return { message: 'Password changed successfully' };
    }


// logout method update
    async logout(userId: number, token?: string, ip?: string, userAgent?: string) {
        // Token blacklist කරන්න
        if (token) {
            this.tokenBlacklistService.blacklist(token);
        }

        const user = await this.usersRepository.findById(userId);
        await this.userLogRepository.create({
            userId,
            branch_id: user?.branch_id ?? undefined,
            action: 'LOGOUT',
            status: 'SUCCESS',
            ip_address: ip,
            user_agent: userAgent,
        });

        return { message: 'Logged out successfully. Token invalidated.' };
    }

}