import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from './roles.decorator';

interface AuthenticatedUser {
    role: string;
}

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // No roles set — any authenticated user can access
        if (!required || required.length === 0) return true;

        const { user } = context.switchToHttp().getRequest<{ user: AuthenticatedUser }>();

        if (!required.includes(user.role)) {
            throw new ForbiddenException(
                `Access denied. Required role: ${required.join(' or ')}`,
            );
        }

        return true;
    }
}