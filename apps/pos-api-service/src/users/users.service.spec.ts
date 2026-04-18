import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('UsersService', () => {
    let usersService: UsersService;

    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        role: {
            findUnique: jest.fn(),
        },
        userInfo: {
            upsert: jest.fn(),
        },
        userRole: {
            deleteMany: jest.fn(),
            create: jest.fn(),
        },
        userLog: {
            findMany: jest.fn(),
            create: jest.fn(),
        },
        $transaction: jest.fn((fn) => fn(mockPrismaService)),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        usersService = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // ─── Create User Tests ─────────────────────────────────────────
    describe('create', () => {
        it('should create a user successfully', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockPrismaService.role.findUnique.mockResolvedValue({
                id: 'role-id',
                name: 'CASHIER',
            });
            mockPrismaService.user.create.mockResolvedValue({
                user_id: 1,
                username: 'cashier1',
                password: 'hashed',
                status: 'ACTIVE',
                user_type: 'STAFF',
                company_id: 1,
                branch_id: 1,
                info: { first_name: 'John', last_name: 'Doe' },
                userRoles: [{ role: { name: 'CASHIER' } }],
            });

            const result = await usersService.create({
                username: 'cashier1',
                password: 'Pass@123',
                role: 'CASHIER',
                company_id: 1,
                branch_id: 1,
                firstName: 'John',
                lastName: 'Doe',
            });

            expect(result.username).toBe('cashier1');
            expect(result).not.toHaveProperty('password');
        });

        it('should throw ConflictException if username exists', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({
                user_id: 1,
                username: 'cashier1',
            });

            await expect(
                usersService.create({
                    username: 'cashier1',
                    password: 'Pass@123',
                    role: 'CASHIER',
                    company_id: 1,
                    branch_id: 1,
                    firstName: 'John',
                    lastName: 'Doe',
                }),
            ).rejects.toThrow(ConflictException);
        });

        it('should throw BadRequestException if role not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockPrismaService.role.findUnique.mockResolvedValue(null);

            await expect(
                usersService.create({
                    username: 'cashier1',
                    password: 'Pass@123',
                    role: 'INVALID_ROLE',
                    company_id: 1,
                    branch_id: 1,
                    firstName: 'John',
                    lastName: 'Doe',
                }),
            ).rejects.toThrow(BadRequestException);
        });
    });

    // ─── Find All Tests ────────────────────────────────────────────
    describe('findAll', () => {
        it('should return all users', async () => {
            mockPrismaService.user.findMany.mockResolvedValue([
                {
                    user_id: 1,
                    username: 'admin',
                    password: 'hashed',
                    status: 'ACTIVE',
                    info: null,
                    userRoles: [],
                },
            ]);

            const result = await usersService.findAll();
            expect(result).toHaveLength(1);
            expect(result[0]).not.toHaveProperty('password');
        });
    });

    // ─── Find One Tests ────────────────────────────────────────────
    describe('findOne', () => {
        it('should return a user by id', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({
                user_id: 1,
                username: 'admin',
                password: 'hashed',
                status: 'ACTIVE',
                info: null,
                userRoles: [],
            });

            const result = await usersService.findOne(1);
            expect(result.username).toBe('admin');
        });

        it('should throw NotFoundException if user not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(usersService.findOne(999)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    // ─── Deactivate Tests ──────────────────────────────────────────
    describe('deactivate', () => {
        it('should deactivate a user', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({
                user_id: 1,
                username: 'admin',
                password: 'hashed',
                status: 'ACTIVE',
                info: null,
                userRoles: [],
            });
            mockPrismaService.user.update.mockResolvedValue({});

            const result = await usersService.deactivate(1);
            expect(result).toEqual({ message: 'User deactivated successfully' });
        });
    });
});