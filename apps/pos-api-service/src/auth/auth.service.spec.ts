import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { UserLogRepository } from '../users/user-log.repository';
import { TokenBlacklistService } from './token-blacklist.service';

const mockUser = {
    id: 1,
    username: 'admin',
    password: '$2b$10$dUmWq7KjOLSn7qv4P0EwxO5InE470tQALkxA3QziGe951b4zR9PCe',
    status: 'ACTIVE',
    user_type: 'ADMIN',
    company_id: 1,
    branch_id: 1,
    failed_login_attempts: 0,
    last_failed_login: null,
    account_locked_until: null,
    last_login_at: null,
    userRoles: [{ role: { name: 'ADMIN' } }],
    info: { first_name: 'Super', last_name: 'Admin' },
    company: { id: 1, name: 'Ryzera' },
    branch: { id: 1, name: 'HQ' },
};

const mockUsersRepository = {
    findByUsername: jest.fn(),
    findById: jest.fn(),
    updateLoginSuccess: jest.fn(),
    updateLoginFailed: jest.fn(),
    updatePassword: jest.fn(),
};

const mockUserLogRepository = {
    create: jest.fn(),
    findByUser: jest.fn(),
};

const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

const mockTokenBlacklistService = {
    blacklist: jest.fn(),
    isBlacklisted: jest.fn().mockReturnValue(false),
};

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersRepository, useValue: mockUsersRepository },
                { provide: UserLogRepository, useValue: mockUserLogRepository },
                { provide: JwtService, useValue: mockJwtService },
                { provide: TokenBlacklistService, useValue: mockTokenBlacklistService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jest.clearAllMocks();
    });

    // ─── Login ────────────────────────────────────────────
    describe('login()', () => {
        it('should return access_token on valid credentials', async () => {
            mockUsersRepository.findByUsername.mockResolvedValue(mockUser);
            mockUsersRepository.updateLoginSuccess.mockResolvedValue(mockUser);
            mockUserLogRepository.create.mockResolvedValue({});

            const result = await service.login({ username: 'admin', password: 'admin123' });

            expect(result).toHaveProperty('access_token');
            expect(result.user.username).toBe('admin');
            expect(mockUsersRepository.findByUsername).toHaveBeenCalledWith('admin');
        });

        it('should throw UnauthorizedException for non-existent user', async () => {
            mockUsersRepository.findByUsername.mockResolvedValue(null);

            await expect(
                service.login({ username: 'unknown', password: 'pass123' }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException for wrong password', async () => {
            mockUsersRepository.findByUsername.mockResolvedValue(mockUser);
            mockUsersRepository.updateLoginFailed.mockResolvedValue({});
            mockUserLogRepository.create.mockResolvedValue({});

            await expect(
                service.login({ username: 'admin', password: 'wrongpass' }),
            ).rejects.toThrow(UnauthorizedException);

            expect(mockUsersRepository.updateLoginFailed).toHaveBeenCalled();
        });

        it('should throw ForbiddenException for locked account', async () => {
            const lockedUser = {
                ...mockUser,
                account_locked_until: new Date(Date.now() + 30 * 60 * 1000),
                status: 'SUSPENDED',
            };
            mockUsersRepository.findByUsername.mockResolvedValue(lockedUser);

            await expect(
                service.login({ username: 'admin', password: 'admin123' }),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should throw ForbiddenException for inactive user', async () => {
            const inactiveUser = { ...mockUser, status: 'INACTIVE' };
            mockUsersRepository.findByUsername.mockResolvedValue(inactiveUser);

            await expect(
                service.login({ username: 'admin', password: 'admin123' }),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should log successful login', async () => {
            mockUsersRepository.findByUsername.mockResolvedValue(mockUser);
            mockUsersRepository.updateLoginSuccess.mockResolvedValue(mockUser);
            mockUserLogRepository.create.mockResolvedValue({});

            await service.login({ username: 'admin', password: 'admin123' });

            expect(mockUserLogRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ action: 'LOGIN', status: 'SUCCESS' }),
            );
        });

        it('should log failed login attempt', async () => {
            mockUsersRepository.findByUsername.mockResolvedValue(mockUser);
            mockUsersRepository.updateLoginFailed.mockResolvedValue({});
            mockUserLogRepository.create.mockResolvedValue({});

            try {
                await service.login({ username: 'admin', password: 'wrong' });
            } catch {}

            expect(mockUserLogRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ action: 'LOGIN', status: 'FAILED' }),
            );
        });
    });

    // ─── Logout ───────────────────────────────────────────
    describe('logout()', () => {
        it('should blacklist token on logout', async () => {
            mockUsersRepository.findById.mockResolvedValue(mockUser);
            mockUserLogRepository.create.mockResolvedValue({});

            await service.logout(1, 'test-token');

            expect(mockTokenBlacklistService.blacklist).toHaveBeenCalledWith('test-token');
        });

        it('should log logout action', async () => {
            mockUsersRepository.findById.mockResolvedValue(mockUser);
            mockUserLogRepository.create.mockResolvedValue({});

            await service.logout(1, 'test-token');

            expect(mockUserLogRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ action: 'LOGOUT', status: 'SUCCESS' }),
            );
        });
    });

    // ─── Change Password ──────────────────────────────────
    describe('changePassword()', () => {
        it('should throw for wrong current password', async () => {
            mockUsersRepository.findById.mockResolvedValue(mockUser);

            await expect(
                service.changePassword(1, {
                    currentPassword: 'wrongpass',
                    newPassword: 'newpass123',
                    confirmPassword: 'newpass123',
                }),
            ).rejects.toThrow();
        });
    });

    // ─── Get Profile ──────────────────────────────────────
    describe('getProfile()', () => {
        it('should return user without password', async () => {
            mockUsersRepository.findById.mockResolvedValue(mockUser);

            const result = await service.getProfile(1);

            expect(result).not.toHaveProperty('password');
            expect(mockUsersRepository.findById).toHaveBeenCalledWith(1);
        });

        it('should throw UnauthorizedException for non-existent user', async () => {
            mockUsersRepository.findById.mockResolvedValue(null);

            await expect(service.getProfile(999)).rejects.toThrow(UnauthorizedException);
        });
    });
});