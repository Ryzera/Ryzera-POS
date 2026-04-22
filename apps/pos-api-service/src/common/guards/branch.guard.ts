import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class BranchGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user    = request.user;

        if (user.role === 'SUPER_ADMIN') return true;

        const requestedBranchId = request.query.branchId as string ?? null;

        if (requestedBranchId !== null && Number(requestedBranchId) !== Number(user.branchId)) {
            throw new ForbiddenException('You can only access data from your own branch');
        }
        return true;
    }
}