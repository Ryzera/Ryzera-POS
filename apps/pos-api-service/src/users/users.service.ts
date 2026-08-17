import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { UserLogRepository } from './user-log.repository';
import {
    CreateUserDto,
    UpdateUserDto,
    UserFilterDto,
} from '@ryzera/pos-schema';

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly userLogRepository: UserLogRepository,
    ) {}

    // ─── Create User ──────────────────────────────────────
    async create(dto: CreateUserDto) {
        // Duplicate username check
        const existing = await this.usersRepository.findByUsername(dto.username);
        if (existing) {
            throw new ConflictException('Username already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(dto.password, 12);

        const user = await this.usersRepository.create(dto, hashedPassword);

        // Log
        await this.userLogRepository.create({
            userId: user.id,
            action: 'CREATE_USER',
            status: 'SUCCESS',
        });

        return user;
    }

    // ─── Find All ─────────────────────────────────────────
    async findAll(filters: UserFilterDto) {
        return this.usersRepository.findAll(filters);
    }

    // ─── Find One ─────────────────────────────────────────
    async findOne(id: number) {
        const user = await this.usersRepository.findById(id);
        if (!user) throw new NotFoundException(`User #${id} not found`);
        return user;
    }

    // ─── Update ───────────────────────────────────────────
    async update(id: number, dto: UpdateUserDto) {
        await this.findOne(id); // exists check
        return this.usersRepository.update(id, dto);
    }

    // ─── Remove ───────────────────────────────────────────
    async remove(id: number) {
        await this.findOne(id);

        // Related records - first delete
        await this.usersRepository.deleteUserRelations(id);

        return this.usersRepository.delete(id);
    }

    // ─── Assign Role ──────────────────────────────────────
    async assignRole(userId: number, roleId: number) {
        await this.findOne(userId); // exists check
        return this.usersRepository.assignRole(userId, roleId);
    }

    // ─── Remove Role ──────────────────────────────────────
    async removeRole(userId: number, roleId: number) {
        await this.findOne(userId); // exists check
        return this.usersRepository.removeRole(userId, roleId);
    }

    // ─── Get Logs ─────────────────────────────────────────
    async getLogs(userId: number) {
        await this.findOne(userId); // exists check
        return this.userLogRepository.findByUser(userId);
    }
}