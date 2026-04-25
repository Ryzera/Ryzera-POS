import { z } from 'zod';

/**
 * Validates notification creation requests.
 * Notifications can be sent to specific users or globally (userId = null).
 */
export const CreateNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL']).default('INFO'),
  userId: z.string().uuid().optional(),
});

export type CreateNotificationDto = z.infer<typeof CreateNotificationSchema>;