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

        // Adjust these two lines to match whatever your JwtStrategy actually
        // returns as req.user (e.g. user.roleName vs user.userRoles[0].role.name).
        const roleName: string = user.roleName ?? user.userRoles?.[0]?.role?.name ?? '';
        const branch_id: number | null = user.branch_id ?? user.branchId ?? null;

        const isAdmin = roleName === 'ADMIN';

        return {
            branchId: isAdmin ? undefined : (branch_id ?? undefined),
            userId: user.id ?? user.sub,
            roleName,
        };
    },
);