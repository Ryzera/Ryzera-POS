import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '@ryzera/pos-schema';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        // Required roles check කරන්න
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        // Roles නැත්නම් — public endpoint
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        // User JWT payload එකෙන් ගන්න
        const request = context.switchToHttp().getRequest();
        const user: JwtPayload = request.user;

        if (!user) {
            throw new ForbiddenException('No user found in request');
        }

        // ADMIN can access everywhere
        if (user.roles.includes('ADMIN') || user.userType === 'ADMIN') {
            return true;
        }

        // Role match check
        const hasRole = requiredRoles.some((role) => user.roles.includes(role));

        if (!hasRole) {
            throw new ForbiddenException(
                `Access denied. Required roles: ${requiredRoles.join(', ')}`,
            );
        }

        return true;
    }
}