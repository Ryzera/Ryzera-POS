import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserFilterDto } from '@ryzera/pos-schema';
import { Prisma } from '@ryzera/pos-database';

@Injectable()
export class UsersRepository {
    constructor(private readonly prisma: PrismaService) {}

    // ─── Find All (with filters) ──────────────────────────
    async findAll(filters: UserFilterDto) {
        const where: Prisma.UserWhereInput = {};

        if (filters.company_id) where.company_id = filters.company_id;
        if (filters.branch_id) where.branch_id = filters.branch_id;
        if (filters.status) where.status = filters.status;
        if (filters.user_type) where.user_type = filters.user_type;
        if (filters.search) {
            where.username = { contains: filters.search, mode: 'insensitive' };
        }

        return this.prisma.user.findMany({
            where,
            include: {
                info: true,
                company: { select: { id: true, name: true, code: true } },
                branch: { select: { id: true, name: true, code: true } },
                userRoles: {
                    include: {
                        role: {
                            include: { authorities: { include: { authority: true } } },
                        },
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }

    // ─── Find By ID ───────────────────────────────────────
    async findById(id: number) {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                info: true,
                company: { select: { id: true, name: true, code: true } },
                branch: { select: { id: true, name: true, code: true } },
                userRoles: {
                    include: {
                        role: {
                            include: { authorities: { include: { authority: true } } },
                        },
                    },
                },
            },
        });
    }

    // ─── Find By Username ─────────────────────────────────
    async findByUsername(username: string) {
        return this.prisma.user.findUnique({
            where: { username },
            include: {
                info: true,
                company: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } },
                userRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
    }
    // ─── Create ───────────────────────────────────────────
    async create(dto: CreateUserDto, hashedPassword: string) {
        return this.prisma.user.create({
            data: {
                username: dto.username,
                password: hashedPassword,
                company_id: dto.company_id,
                branch_id: dto.branch_id,
                user_type: dto.user_type,
                info: {
                    create: {
                        first_name: dto.first_name,
                        last_name: dto.last_name,
                        email: dto.email,
                        phone_number: dto.phone_number,
                        //address: dto.address,
                        //profile_picture: dto.profile_picture,
                    },
                },
            },
            include: { info: true },
        });
    }

    // ─── Update ───────────────────────────────────────────
    async update(id: number, dto: UpdateUserDto) {
        const { first_name, last_name, email, phone_number, address,
            profile_picture, ...userFields } = dto;

        return this.prisma.user.update({
            where: { id },
            data: {
                ...userFields,
                info: {
                    update: {
                        ...(first_name && { first_name }),
                        ...(last_name && { last_name }),
                        ...(email && { email }),
                        ...(phone_number && { phone_number }),
                        ...(address && { address }),
                        ...(profile_picture && { profile_picture }),
                    },
                },
            },
            include: { info: true },
        });
    }

    // ─── Delete ───────────────────────────────────────────
    async delete(id: number) {
        return this.prisma.user.delete({ where: { id } });
    }

    // ─── Assign Role ──────────────────────────────────────
    async assignRole(userId: number, roleId: number) {
        return this.prisma.userRole.upsert({
            where: { userId_roleId: { userId, roleId } },
            update: {},
            create: { userId, roleId },
        });
    }

    // ─── Remove Role ──────────────────────────────────────
    async removeRole(userId: number, roleId: number) {
        return this.prisma.userRole.delete({
            where: { userId_roleId: { userId, roleId } },
        });
    }

    // ─── Update Login Metadata ────────────────────────────
    async updateLoginSuccess(id: number) {
        return this.prisma.user.update({
            where: { id },
            data: {
                last_login_at: new Date(),
                failed_login_attempts: 0,
                last_failed_login: null,
                account_locked_until: null,
            },
        });
    }

    async updateLoginFailed(id: number, attempts: number) {
        const data: Prisma.UserUpdateInput = {
            failed_login_attempts: attempts,
            last_failed_login: new Date(),
        };

        // after 5 attempts lock for 30 minutes
        if (attempts >= 5) {
            data.account_locked_until = new Date(Date.now() + 30 * 60 * 1000);
            data.status = 'SUSPENDED';
        }

        return this.prisma.user.update({ where: { id }, data });
    }

    // ─── Update Password ──────────────────────────────────
    async updatePassword(id: number, hashedPassword: string) {
        return this.prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });
    }
    async deleteUserRelations(userId: number) {
        // UserRoles delete
        await this.prisma.userRole.deleteMany({
            where: { userId },
        });

        // UserLogs delete
        await this.prisma.userLog.deleteMany({
            where: { userId },
        });

        // UserInfo delete
        await this.prisma.userInfo.deleteMany({
            where: { user_id: userId },
        });
    }
}


