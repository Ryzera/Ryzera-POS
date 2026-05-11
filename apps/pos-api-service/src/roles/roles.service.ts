import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { RolesRepository } from './roles.repository';
import {
    CreateRoleDto,
    UpdateRoleDto,
    CreateAuthorityDto,
} from '@ryzera/pos-schema';

@Injectable()
export class RolesService {
    constructor(private readonly rolesRepository: RolesRepository) {}

    // ─── Roles ────────────────────────────────────────────

    async findAllRoles() {
        return this.rolesRepository.findAllRoles();
    }

    async findOneRole(id: number) {
        const role = await this.rolesRepository.findRoleById(id);
        if (!role) throw new NotFoundException(`Role #${id} not found`);
        return role;
    }

    async createRole(dto: CreateRoleDto) {
        const existing = await this.rolesRepository.findRoleByName(dto.name);
        if (existing) throw new ConflictException('Role name already exists');
        return this.rolesRepository.createRole(dto);
    }

    async updateRole(id: number, dto: UpdateRoleDto) {
        await this.findOneRole(id);
        return this.rolesRepository.updateRole(id, dto);
    }

    async deleteRole(id: number) {
        await this.findOneRole(id);
        return this.rolesRepository.deleteRole(id);
    }

    // ─── Authorities ──────────────────────────────────────

    async findAllAuthorities() {
        return this.rolesRepository.findAllAuthorities();
    }

    async createAuthority(dto: CreateAuthorityDto) {
        return this.rolesRepository.createAuthority(dto);
    }

    async deleteAuthority(id: number) {
        const authority = await this.rolesRepository.findAuthorityById(id);
        if (!authority) throw new NotFoundException(`Authority #${id} not found`);
        return this.rolesRepository.deleteAuthority(id);
    }

    // ─── Assign / Remove Authority ────────────────────────

    async assignAuthority(roleId: number, authorityId: number) {
        await this.findOneRole(roleId);
        return this.rolesRepository.assignAuthority(roleId, authorityId);
    }

    async removeAuthority(roleId: number, authorityId: number) {
        await this.findOneRole(roleId);
        return this.rolesRepository.removeAuthority(roleId, authorityId);
    }
}