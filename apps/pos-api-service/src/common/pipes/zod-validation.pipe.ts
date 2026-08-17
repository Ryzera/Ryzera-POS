import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
    constructor(private schema: ZodSchema) {}

    transform(value: unknown) {
        const result = this.schema.safeParse(value);
        if (!result.success) {
            throw new BadRequestException(
                result.error.issues.map((e) => ({ // ← .errors වෙනුවට .issues
                    field: e.path.join('.'),
                    message: e.message,
                })),
            );
        }
        return result.data;
    }
}