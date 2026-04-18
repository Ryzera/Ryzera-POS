import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { type ZodSchema } from 'zod';

/**
 * Generic Zod validation pipe.
 *
 * Usage:
 *   @Query(new ZodValidationPipe(QuerySalesReportSchema)) query: QuerySalesReportDto
 *   @Body(new ZodValidationPipe(CreateSummarySchema))    body:  CreateSummaryDto
 */
@Injectable()
export class ZodValidationPipe<T = unknown> implements PipeTransform<unknown, T> {
    constructor(private readonly schema: ZodSchema<T>) {}

    transform(value: unknown): T {
        const result = this.schema.safeParse(value);

        if (!result.success) {
            // Group error messages by field path for a structured error response
            const fields = result.error.issues.reduce<Record<string, string[]>>(
                (acc, issue) => {
                    const key = issue.path.join('.') || 'root';
                    acc[key] ??= [];
                    acc[key].push(issue.message);
                    return acc;
                },
                {},
            );

            throw new BadRequestException({
                statusCode: 400,
                message:    'Validation failed',
                errors:     fields,
            });
        }

        return result.data;
    }
}