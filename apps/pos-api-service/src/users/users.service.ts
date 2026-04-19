import {
    Injectable,
    ConflictException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async create(dto: CreateUserDto) {
        const existing = await this.prisma.user.findUnique({
            where: { username: dto.username },
        });
        if (existing) throw new ConflictException('Username already exists');

        const role = await this.prisma.role.findUnique({
            where: { name: dto.role },
        });
        if (!role) throw new BadRequestException(`Role '${dto.role}' not found`);

        const hashedPassword = await bcrypt.hash(dto.password, 12);

        const user = await this.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
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
            return newUser;
        });

        return this.formatUser(user);
    }

    async findAll() {
        const users = await this.prisma.user.findMany({
            include: {
                info: true,
                userRoles: { include: { role: true } },
            },
            orderBy: { created_at: 'desc' },
        });
        return users.map(this.formatUser);
    }

    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { user_id: id },
            include: {
                info: true,
                userRoles: { include: { role: true } },
            },
        });
        if (!user) throw new NotFoundException('User not found');
        return this.formatUser(user);
    }

    async update(id: number, dto: UpdateUserDto) {
        await this.findOne(id);

        await this.prisma.$transaction(async (tx) => {
            if (dto.status !== undefined) {
                await tx.user.update({
                    where: { user_id: id },
                    data: { status: dto.status },
                });
            }

            await tx.userInfo.upsert({
                where: { user_id: id },
                update: {
                    first_name: dto.firstName,
                    last_name: dto.lastName,
                    email: dto.email,
                    phone: dto.phone,
                },
                create: {
                    user_id: id,
                    first_name: dto.firstName ?? '',
                    last_name: dto.lastName ?? '',
                    email: dto.email,
                    phone: dto.phone,
                },
            });
        });

        return this.findOne(id);
    }

    async deactivate(id: number) {
        await this.findOne(id);
        await this.prisma.user.update({
            where: { user_id: id },
            data: { status: 'INACTIVE' },
        });
        return { message: 'User deactivated successfully' };
    }

    async assignRole(userId: number, roleName: string) {
        await this.findOne(userId);

        const role = await this.prisma.role.findUnique({
            where: { name: roleName },
        });
        if (!role) throw new BadRequestException(`Role '${roleName}' not found`);

        await this.prisma.$transaction(async (tx) => {
            await tx.userRole.deleteMany({ where: { userId } });
            await tx.userRole.create({ data: { userId, roleId: role.id } });

            await tx.userLog.create({
                data: {
                    userId,
                    branch_id: 1,
                    action: 'ROLE_ASSIGNED',
                    status: 'SUCCESS',
                },
            });
        });

        return this.findOne(userId);
    }

    async getUserLogs(userId: number) {
        await this.findOne(userId);
        return this.prisma.userLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    private formatUser(user: any) {
        const { password, ...rest } = user;
        return {
            ...rest,
            roles: user.userRoles?.map((ur: any) => ur.role.name) ?? [],
        };
    }
}