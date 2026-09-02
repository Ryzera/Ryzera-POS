import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateCashierDto } from './dto/create-cashier.schema';
import { UpdateCashierDto } from './dto/update-cashier.schema';

const CASHIER_ROLE_NAME = 'CASHIER';

@Injectable()
export class CashierService {
  constructor(private prisma: PrismaService) {}

  // ── List cashiers — role-scoped, filtered to actual CASHIER role ──
  async findAll(userType: string, userBranchId: number | null, userCompanyId: number) {
    const where: any = {
      company_id: userCompanyId,
      userRoles: { some: { role: { name: CASHIER_ROLE_NAME } } },
    };

    if (userType !== 'ADMIN') {
      where.branch_id = userBranchId;
    }

    return this.prisma.user.findMany({
      where,
      include: { info: true, branch: true, userRoles: { include: { role: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async findByBranch(branchId: number, userCompanyId: number) {
    return this.prisma.user.findMany({
      where: {
        company_id: userCompanyId,
        branch_id: branchId,
        userRoles: { some: { role: { name: CASHIER_ROLE_NAME } } },
      },
      include: { info: true, branch: true, userRoles: { include: { role: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  // ── Create cashier — now also assigns the CASHIER role ────────────
  async create(dto: CreateCashierDto, userCompanyId: number) {
    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (existing && existing.status !== 'INACTIVE') {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const cashierRole = await this.prisma.role.upsert({
      where: { name: CASHIER_ROLE_NAME },
      update: {},
      create: { name: CASHIER_ROLE_NAME },
    });

    if (existing) {
      // Reuse the inactive row — username is unique, so we reactivate it instead of inserting a new row
      return this.prisma.user.update({
        where: { id: existing.id },
        data: {
          password:   hashedPassword,
          company_id: userCompanyId,
          branch_id:  dto.branch_id,
          user_type:  dto.user_type,
          status:     'ACTIVE',
          info: {
            upsert: {
              create: {
                first_name:   dto.first_name,
                last_name:    dto.last_name,
                email:        dto.email,
                phone_number: dto.phone_number,
                address:      dto.address,
              },
              update: {
                first_name:   dto.first_name,
                last_name:    dto.last_name,
                email:        dto.email,
                phone_number: dto.phone_number,
                address:      dto.address,
              },
            },
          },
          userRoles: {
            connectOrCreate: {
              where: { userId_roleId: { userId: existing.id, roleId: cashierRole.id } },
              create: { roleId: cashierRole.id },
            },
          },
        },
        include: { info: true, branch: true, userRoles: { include: { role: true } } },
      });
    }

    return this.prisma.user.create({
      data: {
        username:   dto.username,
        password:   hashedPassword,
        company_id: userCompanyId,
        branch_id:  dto.branch_id,
        user_type:  dto.user_type,
        status:     'ACTIVE',
        info: {
          create: {
            first_name:   dto.first_name,
            last_name:    dto.last_name,
            email:        dto.email,
            phone_number: dto.phone_number,
            address:      dto.address,
          },
        },
        userRoles: {
          create: { roleId: cashierRole.id },
        },
      },
      include: { info: true, branch: true, userRoles: { include: { role: true } } },
    });
  }

  // update() and deactivate() unchanged


  // ── Update cashier ────────────────────────────────────
  async update(id: number, dto: UpdateCashierDto) {
    // Changed user_id: id -> id
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Cashier not found');

    const hasInfoUpdates =
        dto.first_name !== undefined ||
        dto.last_name !== undefined ||
        dto.email !== undefined ||
        dto.phone_number !== undefined ||
        dto.address !== undefined;

    return this.prisma.user.update({
      where: { id }, // Changed user_id: id -> id
      data: {
        branch_id: dto.branch_id,
        status:    dto.status,
        ...(hasInfoUpdates && {
          info: { // Changed user_info -> info with upsert safety
            upsert: {
              create: {
                first_name:   dto.first_name ?? '',
                last_name:    dto.last_name ?? '',
                email:        dto.email,
                phone_number: dto.phone_number,
                address:      dto.address,
              },
              update: {
                first_name:   dto.first_name,
                last_name:    dto.last_name,
                email:        dto.email,
                phone_number: dto.phone_number,
                address:      dto.address,
              },
            },
          },
        }),
      },
      include: { info: true, branch: true }, // Changed user_info -> info
    });
  }

  // ── Soft delete (deactivate) — hard delete NEVER ──────
  async deactivate(id: number) {
    // Changed user_id: id -> id
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Cashier not found');

    return this.prisma.user.update({
      where: { id }, // Changed user_id: id -> id
      data: { status: 'INACTIVE' },
    });
  }
}