import { z } from 'zod';

export const CreateKpiTargetSchema = z.object({
  period_type: z.enum(['Daily', 'Weekly', 'Monthly']),
  target_amount: z.number().positive(),
  branch_id: z.number().int().default(0),
});

export type CreateKpiTargetDto = z.infer<typeof CreateKpiTargetSchema>;
