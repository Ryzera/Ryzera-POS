import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenBlacklistService } from '../token-blacklist.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private tokenBlacklistService: TokenBlacklistService) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (authHeader) {
            const token = authHeader.split(' ')[1];
            if (this.tokenBlacklistService.isBlacklisted(token)) {
                throw new UnauthorizedException('Token has been invalidated');
            }
        }

        return super.canActivate(context);
    }
}