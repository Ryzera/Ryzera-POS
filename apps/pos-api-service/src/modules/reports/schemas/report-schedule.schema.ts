import { z } from 'zod';
import { ReportType } from '../enums/report-type.enum';
import { ScheduleFrequency } from '../enums/delivery-status.enum';

const SCHEDULE_NAME_MIN = 3;
const SCHEDULE_NAME_MAX = 100;

export const CreateReportScheduleSchema = z.object({
  scheduleName: z
    .string()
    .min(
      SCHEDULE_NAME_MIN,
      `Schedule name must be at least ${SCHEDULE_NAME_MIN} characters`,
    )
    .max(
      SCHEDULE_NAME_MAX,
      `Schedule name must not exceed ${SCHEDULE_NAME_MAX} characters`,
    )
    .trim(),

  reportType: z.nativeEnum(ReportType, {
    error: 'Invalid report type provided',
  }),

  frequency: z.nativeEnum(ScheduleFrequency, {
    error: 'frequency must be DAILY, WEEKLY, or MONTHLY',
  }),

  recipientEmail: z
    .string()
    .email('A valid recipient email address is required')
    .max(255, 'Email address must not exceed 255 characters'),

  branchId: z
    .number()
    .int('branchId must be an integer')
    .positive('branchId must be a positive integer')
    .optional(),

  isActive: z.boolean().default(true),
});

export type CreateReportScheduleDto = z.infer<
  typeof CreateReportScheduleSchema
>;

export const UpdateScheduleStatusSchema = z.object({
  isActive: z.boolean(),
});

export type UpdateScheduleStatusDto = z.infer<
  typeof UpdateScheduleStatusSchema
>;
