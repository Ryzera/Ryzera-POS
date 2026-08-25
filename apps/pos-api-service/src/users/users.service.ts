import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { UserLogRepository } from './user-log.repository';
import { RolesRepository } from '../roles/roles.repository';
import {
    CreateUserDto,
    UpdateUserDto,
    UserFilterDto,
    JwtPayload,
} from '@ryzera/pos-schema';

const STAFF_ROLES_MANAGER_CAN_ASSIGN = ['CASHIER', 'INVENTORY_MANAGER'];

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly userLogRepository: UserLogRepository,
        private readonly rolesRepository: RolesRepository,
    ) {}

    // ─── Create User ──────────────────────────────────────
    async create(dto: CreateUserDto, actor: JwtPayload) {
        if (actor.userType !== 'ADMIN') {
            if (dto.user_type === 'ADMIN') {
                throw new ForbiddenException('Managers cannot create ADMIN users');
            }
            if (dto.company_id !== actor.companyId) {
                throw new ForbiddenException(
                    'Cannot create a user in another company',
                );
            }
            if (dto.branch_id !== actor.branchId) {
                throw new ForbiddenException(
                    'Managers can only create users in their own branch',
                );
            }
        }

        const existing = await this.usersRepository.findByUsername(dto.username);
        if (existing) {
            throw new ConflictException('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.usersRepository.create(dto, hashedPassword);

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

    // ─── Find One, scoped to actor's branch (non-admin) ────
    async findOneScoped(id: number, actor: JwtPayload) {
        const user = await this.findOne(id);
        if (actor.userType !== 'ADMIN' && user.branch_id !== actor.branchId) {
            throw new ForbiddenException(
                'You cannot access users outside your branch',
            );
        }
        return user;
    }

    // ─── Update ───────────────────────────────────────────
    async update(id: number, dto: UpdateUserDto) {
        await this.findOne(id);
        return this.usersRepository.update(id, dto);
    }

    // ─── Remove ───────────────────────────────────────────
    async remove(id: number) {
        await this.findOne(id);
        await this.usersRepository.deleteUserRelations(id);
        return this.usersRepository.delete(id);
    }

    // ─── Assign Role ──────────────────────────────────────
    async assignRole(userId: number, roleId: number, actor: JwtPayload) {
        const targetUser = await this.findOne(userId);

        if (actor.userType !== 'ADMIN') {
            const role = await this.rolesRepository.findRoleById(roleId);
            if (!role) throw new NotFoundException(`Role #${roleId} not found`);

            if (!STAFF_ROLES_MANAGER_CAN_ASSIGN.includes(role.name)) {
                throw new ForbiddenException(
                    `Managers can only assign role: ${STAFF_ROLES_MANAGER_CAN_ASSIGN.join(' or ')}`,
                );
            }

            if (targetUser.branch_id !== actor.branchId) {
                throw new ForbiddenException(
                    'Managers can only assign roles to users in their own branch',
                );
            }
        }

        return this.usersRepository.assignRole(userId, roleId);
    }

    // ─── Remove Role ──────────────────────────────────────
    async removeRole(userId: number, roleId: number) {
        await this.findOne(userId);
        return this.usersRepository.removeRole(userId, roleId);
    }

    // ─── Get Logs ─────────────────────────────────────────
    async getLogs(userId: number) {
        await this.findOne(userId);
        return this.userLogRepository.findByUser(userId);
    }
}