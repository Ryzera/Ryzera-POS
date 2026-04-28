import { Injectable } from '@nestjs/common';
import { PrismaService } from '@ryzera/pos-database';

interface CreateUserData {
  name:      string;
  email:     string;
  password:  string;
  role:      'ADMIN' | 'MANAGER' | 'STAFF';
  branchId?: string;
}

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where:  { email },
      select: {
        id:       true,
        name:     true,
        email:    true,
        password: true,
        role:     true,
        branchId: true,
      },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where:  { id },
      select: {
        id:       true,
        name:     true,
        email:    true,
        role:     true,
        branchId: true,
        branch:   { select: { id: true, name: true } },
      },
    });
  }

  create(data: CreateUserData) {
    return this.prisma.user.create({
      data: {
        name:     data.name,
        email:    data.email,
        password: data.password,
        role:     data.role,
        ...(data.branchId ? { branch: { connect: { id: data.branchId } } } : {}),
      },
      select: {
        id:       true,
        name:     true,
        email:    true,
        role:     true,
        branchId: true,
      },
    });
  }
}