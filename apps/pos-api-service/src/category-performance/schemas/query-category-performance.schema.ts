import { z } from 'zod';

export const QueryCategoryPerformanceSchema = z
  .object({
    /** ISO date string — start of the report range (inclusive) */
    dateFrom: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'dateFrom must be in YYYY-MM-DD format',
      })
      .optional(),

    /** ISO date string — end of the report range (inclusive) */
    dateTo: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'dateTo must be in YYYY-MM-DD format',
      })
      .optional(),

    branchId: z.coerce.number().int().positive().optional(),
  })
  .refine(
    (data) => {
      // Both dates must be present together, or both absent.
      if (data.dateFrom && !data.dateTo) return false;
      if (data.dateTo && !data.dateFrom) return false;
      return true;
    },
    { message: 'Both dateFrom and dateTo must be provided together' },
  )
  .refine(
    (data) => {
      // If both dates are provided, dateFrom must not be after dateTo.
      if (data.dateFrom && data.dateTo) {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
      }
      return true;
    },
    { message: 'dateFrom must not be after dateTo' },
  );

export type QueryCategoryPerformanceDto = z.infer<
  typeof QueryCategoryPerformanceSchema
>;
