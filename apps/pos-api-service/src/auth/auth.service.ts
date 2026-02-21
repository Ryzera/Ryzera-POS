import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private validateEmail(email: string) {
    if (!email.includes('@')) {
      throw new BadRequestException('Email invalid');
    }
  }

  private validatePassword(password: string) {
    if (password.length < 8 || password.length > 12) {
      throw new BadRequestException(
        'Password must be between 8 and 12 characters',
      );
    }
    if (!/[a-zA-Z]/.test(password)) {
      throw new BadRequestException(
        'Password must contain at least one letter',
      );
    }
    if (!/[0-9]/.test(password)) {
      throw new BadRequestException(
        'Password must contain at least one number',
      );
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      throw new BadRequestException(
        'Password must contain at least one special character',
      );
    }
  }

  async login(email: string, password: string) {
    this.validateEmail(email);

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return {
      access_token: token,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    this.validatePassword(newPassword);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      throw new BadRequestException('Current password is incorrect');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { message: 'Password changed successfully' };
  }

  async seedManager(name: string, email: string, password: string) {
    this.validateEmail(email);
    this.validatePassword(password);

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('User already exists');

    const hashed = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { name, email, password: hashed },
    });
  }
}
