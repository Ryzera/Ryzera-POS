import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@ryzera/pos-database';

import { AuthRepository } from './auth.repository';

interface RegisterDto {
    name:     string;
    email:    string;
    password: string;
    role:     UserRole;
    branchId?: string;
}

interface LoginDto {
    email:    string;
    password: string;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly authRepo: AuthRepository,
        private readonly jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto) {
        const existing = await this.authRepo.findByEmail(dto.email);
        if (existing) {
            throw new ConflictException('Email already registered');
        }

        const hashed = await bcrypt.hash(dto.password, 12);
        const user   = await this.authRepo.create({ ...dto, password: hashed });

        return { message: 'User registered successfully', user };
    }

    async login(dto: LoginDto) {
        const user = await this.authRepo.findByEmail(dto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const passwordMatch = await bcrypt.compare(dto.password, user.password);
        if (!passwordMatch) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const payload = { sub: user.id, email: user.email, role: user.role };
        const token   = await this.jwtService.signAsync(payload);

        return {
            accessToken: token,
            user: {
                id:       user.id,
                name:     user.name,
                email:    user.email,
                role:     user.role,
                branchId: user.branchId,
            },
        };
    }

    me(userId: string) {
        return this.authRepo.findById(userId);
    }
}