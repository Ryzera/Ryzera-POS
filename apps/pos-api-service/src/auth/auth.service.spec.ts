import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
    let authService: AuthService;
    let prismaService: PrismaService;
    let jwtService: JwtService;

    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
        },
        role: {
            findUnique: jest.fn(),
        },
        userLog: {
            create: jest.fn(),
        },
    };

    const mockJwtService = {
        sign: jest.fn().mockReturnValue('mock-token'),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        prismaService = module.get<PrismaService>(PrismaService);
        jwtService = module.get<JwtService>(JwtService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // ─── Login Tests ───────────────────────────────────────────────
    describe('login', () => {
        it('should return accessToken on valid credentials', async () => {
            const hashedPassword = await bcrypt.hash('Admin@123', 12);
            const mockUser = {
                user_id: 1,
                username: 'admin',
                password: hashedPassword,
                status: 'ACTIVE',
                branch_id: 1,
                userRoles: [{ role: { name: 'ADMIN' } }],
                info: { first_name: 'Admin', last_name: 'User' },
            };

            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.user.update.mockResolvedValue(mockUser);
            mockPrismaService.userLog.create.mockResolvedValue({});

            const result = await authService.login({
                username: 'admin',
                password: 'Admin@123',
            });

            expect(result).toHaveProperty('accessToken');
            expect(result.accessToken).toBe('mock-token');
            expect(result.user.username).toBe('admin');
        });

        it('should throw UnauthorizedException if user not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(
                authService.login({ username: 'wrong', password: 'wrong' }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if user is INACTIVE', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({
                user_id: 1,
                username: 'admin',
                password: 'hashed',
                status: 'INACTIVE',
                branch_id: 1,
                userRoles: [],
                info: null,
            });

            await expect(
                authService.login({ username: 'admin', password: 'Admin@123' }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException on wrong password', async () => {
            const hashedPassword = await bcrypt.hash('Admin@123', 12);
            mockPrismaService.user.findUnique.mockResolvedValue({
                user_id: 1,
                username: 'admin',
                password: hashedPassword,
                status: 'ACTIVE',
                branch_id: 1,
                userRoles: [],
                info: null,
            });

            await expect(
                authService.login({ username: 'admin', password: 'WrongPass' }),
            ).rejects.toThrow(UnauthorizedException);
        });
    });

    // ─── Logout Tests ──────────────────────────────────────────────
    describe('logout', () => {
        it('should return success message on logout', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({
                user_id: 1,
                branch_id: 1,
            });
            mockPrismaService.userLog.create.mockResolvedValue({});

            const result = await authService.logout(1);
            expect(result).toEqual({ message: 'Logged out successfully' });
        });
    });

    // ─── GetProfile Tests ──────────────────────────────────────────
    describe('getProfile', () => {
        it('should return user profile', async () => {
            const mockUser = {
                user_id: 1,
                username: 'admin',
                status: 'ACTIVE',
                userRoles: [
                    {
                        role: {
                            name: 'ADMIN',
                            roleAuthorities: [
                                { authority: { name: 'USER_READ' } },
                            ],
                        },
                    },
                ],
                info: { first_name: 'Admin', last_name: 'User' },
            };

            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            const result = await authService.getProfile(1);
            expect(result.username).toBe('admin');
            expect(result.roles).toContain('ADMIN');
            expect(result.authorities).toContain('USER_READ');
        });

        it('should throw UnauthorizedException if user not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(authService.getProfile(999)).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });
});