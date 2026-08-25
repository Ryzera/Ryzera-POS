import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '@ryzera/pos-schema';
import { UsersRepository } from '../../users/users.repository';
import { TokenBlacklistService } from '../token-blacklist.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
      private readonly usersRepository: UsersRepository,
      private readonly tokenBlacklistService: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'ryzera_secret_key',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    // Token blacklist check
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token && this.tokenBlacklistService.isBlacklisted(token)) {
      throw new UnauthorizedException('Token has been invalidated. Please login again.');
    }

    const user = await this.usersRepository.findById(payload.userId);
    if (!user) throw new UnauthorizedException('User not found');
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    return { ...payload, token };
  }
}