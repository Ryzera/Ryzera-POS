import { z } from 'zod';

export const BranchListQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    search: z.string().trim().min(1).optional(),
    companyId: z.coerce.number().int().positive().optional(),
});

export type BranchListQueryDto = z.infer<typeof BranchListQuerySchema>;
