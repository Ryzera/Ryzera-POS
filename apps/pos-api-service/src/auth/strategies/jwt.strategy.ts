import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'fallback-secret',
    });
  }

  async validate(payload: { sub: number; username: string }) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: payload.sub },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                roleAuthorities: { include: { authority: true } },
              },
            },
          },
        },
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User not found or inactive');
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    const authorities = user.userRoles.flatMap((ur) =>
        ur.role.roleAuthorities.map((ra) => ra.authority.name),
    );

    return {
      id: user.user_id,
      username: user.username,
      roles,
      authorities,
    };
  }
}