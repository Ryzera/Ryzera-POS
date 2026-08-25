import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UserLogRepository } from './user-log.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockUsersRepository = {
    findByUsername: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    assignRole: jest.fn(),
    removeRole: jest.fn(),
    deleteUserRelations: jest.fn(),
};

const mockUserLogRepository = {
    create: jest.fn(),
    findByUser: jest.fn(),
};

describe('UsersService', () => {
    let service: UsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: UsersRepository, useValue: mockUsersRepository },
                { provide: UserLogRepository, useValue: mockUserLogRepository },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        jest.clearAllMocks();
    });

    // ─── Create ───────────────────────────────────────────
    describe('create()', () => {
        it('should create user successfully', async () => {
            mockUsersRepository.findByUsername.mockResolvedValue(null);
            mockUsersRepository.create.mockResolvedValue({
                id: 1, username: 'cashier1', status: 'ACTIVE',
                user_type: 'STAFF', company_id: 1, branch_id: 1,
                info: { first_name: 'John', last_name: 'Doe' },
                userRoles: [],
            });
            mockUserLogRepository.create.mockResolvedValue({});

            const result = await service.create({
                username: 'cashier1',
                password: 'password123',
                company_id: 1,
                user_type: 'STAFF',
                first_name: 'John',
                last_name: 'Doe',
            });

            expect(result).toBeDefined();
            expect(mockUsersRepository.create).toHaveBeenCalled();
        });

        it('should throw ConflictException if username exists', async () => {
            mockUsersRepository.findByUsername.mockResolvedValue({ id: 1, username: 'cashier1' });

            await expect(
                service.create({
                    username: 'cashier1',
                    password: 'Pass@123',
                    company_id: 1,
                    user_type: 'STAFF',
                    first_name: 'John',
                    last_name: 'Doe',
                }),
            ).rejects.toThrow(ConflictException);
        });
    });

    // ─── Find All ─────────────────────────────────────────
    describe('findAll()', () => {
        it('should return all users', async () => {
            mockUsersRepository.findAll.mockResolvedValue([
                { id: 1, username: 'admin', status: 'ACTIVE', userRoles: [], info: null },
            ]);

            const result = await service.findAll({});
            expect(result).toHaveLength(1);
        });
    });

    // ─── Find One ─────────────────────────────────────────
    describe('findOne()', () => {
        it('should return user by id', async () => {
            mockUsersRepository.findById.mockResolvedValue({
                id: 1, username: 'admin', status: 'ACTIVE', userRoles: [], info: null,
            });

            const result = await service.findOne(1);
            expect(result.username).toBe('admin');
        });

        it('should throw NotFoundException if user not found', async () => {
            mockUsersRepository.findById.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    // ─── Update ───────────────────────────────────────────
    describe('update()', () => {
        it('should update user status', async () => {
            mockUsersRepository.findById.mockResolvedValue({
                id: 1, username: 'admin', status: 'ACTIVE', userRoles: [], info: null,
            });
            mockUsersRepository.update.mockResolvedValue({
                id: 1, username: 'admin', status: 'INACTIVE',
            });

            const result = await service.update(1, { status: 'INACTIVE' });
            expect(result).toBeDefined();
        });
    });

    // ─── Remove ───────────────────────────────────────────
    describe('remove()', () => {
        it('should delete user', async () => {
            mockUsersRepository.findById.mockResolvedValue({
                id: 1, username: 'admin', status: 'ACTIVE',
            });
            mockUsersRepository.deleteUserRelations.mockResolvedValue({});
            mockUsersRepository.delete.mockResolvedValue({});

            await expect(service.remove(1)).resolves.not.toThrow();
        });

        it('should throw NotFoundException for non-existent user', async () => {
            mockUsersRepository.findById.mockResolvedValue(null);

            await expect(service.remove(999)).rejects.toThrow(NotFoundException);
        });
    });

    // ─── Assign Role ──────────────────────────────────────
    describe('assignRole()', () => {
        it('should assign role to user', async () => {
            mockUsersRepository.findById.mockResolvedValue({ id: 1, username: 'admin' });
            mockUsersRepository.assignRole.mockResolvedValue({});

            await expect(service.assignRole(1, 2)).resolves.not.toThrow();
        });
    });

    // ─── Get Logs ─────────────────────────────────────────
    describe('getLogs()', () => {
        it('should return user logs', async () => {
            mockUsersRepository.findById.mockResolvedValue({ id: 1, username: 'admin' });
            mockUserLogRepository.findByUser.mockResolvedValue([
                { id: 1, action: 'LOGIN', status: 'SUCCESS', created_at: new Date() },
            ]);

            const result = await service.getLogs(1);
            expect(result).toHaveLength(1);
        });
    });
});