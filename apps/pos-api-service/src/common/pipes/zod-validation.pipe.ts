import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { type ZodTypeAny } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodTypeAny) {}

  transform(value: unknown): unknown {
    const result = this.schema.safeParse(value);
    if (!result.success) {
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
        errors: fields,
        message: 'Validation failed',
        statusCode: 400,
      });
    }
    return result.data;
  }
}
