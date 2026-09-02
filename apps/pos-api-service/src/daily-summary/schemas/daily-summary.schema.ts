import { z } from 'zod';

export const QueryDailySummarySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'date must be in YYYY-MM-DD format',
    })
    .optional(),

  branchId: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(
      z
        .number()
        .int()
        .positive({ message: 'branchId must be a positive integer' }),
    )
    .optional(),
});

export type QueryDailySummaryInput = z.infer<typeof QueryDailySummarySchema>;
