import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateRoleDto,
    UpdateRoleDto,
    CreateAuthorityDto,
    AssignAuthorityDto,
} from '@ryzera/pos-schema';

@Injectable()
export class RolesRepository {
    constructor(private readonly prisma: PrismaService) {}

    // ─── Roles ────────────────────────────────────────────
    async findAllRoles() {
        return this.prisma.role.findMany({
            include: {
                authorities: { include: { authority: true } },
                _count: { select: { userRoles: true } },
            },
        });
    }

    async findRoleById(id: number) {
        return this.prisma.role.findUnique({
            where: { id },
            include: { authorities: { include: { authority: true } } },
        });
    }

    async findRoleByName(name: string) {
        return this.prisma.role.findUnique({ where: { name } });
    }

    async createRole(dto: CreateRoleDto) {
        return this.prisma.role.create({ data: dto });
    }

    async updateRole(id: number, dto: UpdateRoleDto) {
        return this.prisma.role.update({ where: { id }, data: dto });
    }

    async deleteRole(id: number) {
        return this.prisma.role.delete({ where: { id } });
    }

    // ─── Authorities ──────────────────────────────────────
    async findAllAuthorities() {
        return this.prisma.authority.findMany();
    }

    async findAuthorityById(id: number) {
        return this.prisma.authority.findUnique({ where: { id } });
    }

    async createAuthority(dto: CreateAuthorityDto) {
        return this.prisma.authority.create({ data: dto });
    }

    async deleteAuthority(id: number) {
        return this.prisma.authority.delete({ where: { id } });
    }

    // ─── Role ↔ Authority ─────────────────────────────────
    async assignAuthority(roleId: number, authorityId: number) {
        return this.prisma.roleAuthority.upsert({
            where: { roleId_authorityId: { roleId, authorityId } },
            update: {},
            create: { roleId, authorityId },
        });
    }

    async removeAuthority(roleId: number, authorityId: number) {
        return this.prisma.roleAuthority.delete({
            where: { roleId_authorityId: { roleId, authorityId } },
        });
    }
}