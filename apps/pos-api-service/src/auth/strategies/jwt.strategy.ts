import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '@ryzera/pos-schema';
import { UsersRepository } from '../../users/users.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersRepository: UsersRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'ryzera_secret_key',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersRepository.findById(payload.userId);

    if (!user) throw new UnauthorizedException('User not found');
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    return payload; // inject to req.user
  }
}