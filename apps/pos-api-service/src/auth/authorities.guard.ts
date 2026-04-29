import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTHORITIES_KEY } from './decorators/authorities.decorator';

@Injectable()
export class AuthoritiesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredAuthorities = this.reflector.getAllAndOverride<string[]>(
            AUTHORITIES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredAuthorities || requiredAuthorities.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        if (!user || !user.authorities) return false;

        return requiredAuthorities.some((authority) =>
            user.authorities.includes(authority),
        );
    }
}