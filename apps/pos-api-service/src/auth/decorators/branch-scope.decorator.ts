import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * "When a Manager logs in, they only see their own branch's data. Nothing else."
 *
 * Use this in any Inventory (or Billing) controller method that lists/reads data:
 *
 *   @Get()
 *   findAll(@BranchScope() scope: BranchScopeResult) {
 *     return this.inventoryService.findAll(scope);
 *   }
 *
 * scope.branchId is:
 *   - undefined  -> ADMIN — no restriction, sees all branches
 *   - a number   -> MANAGER / STAFF — restricted to that branch only
 *
 * Then in the service/repository, apply it to the Prisma `where`:
 *   where: { ...otherFilters, ...(scope.branchId && { branch_id: scope.branchId }) }
 */

export interface BranchScopeResult {
    branchId?: number; // undefined = no restriction (Admin)
    userId: number;
    roleName: string;
}

export const BranchScope = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): BranchScopeResult => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user; // populated by JwtAuthGuard / JwtStrategy.validate()

        // req.user is the decoded JwtPayload: { userId, companyId, branchId, roles, authorities, userType }
        const userType: string = user.userType ?? '';
        const roleName: string = user.roles?.[0] ?? '';
        const branchIdRaw: number | null = user.branchId ?? user.branch_id ?? null;

        const isAdmin = userType === 'ADMIN';

        return {
            branchId: isAdmin ? undefined : (branchIdRaw ?? undefined),
            userId: user.userId ?? user.id ?? user.sub,
            roleName,
        };
    },
);
