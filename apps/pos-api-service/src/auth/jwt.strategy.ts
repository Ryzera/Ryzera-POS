import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from '@ryzera/pos-database';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub:   string;
  email: string;
  role:  string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest:   ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:      process.env.JWT_SECRET ?? 'changeme',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where:  { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, branchId: true },
    });

    if (!user) throw new UnauthorizedException('User no longer exists');
    return user;
  }
}