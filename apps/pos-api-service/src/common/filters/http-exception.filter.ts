import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors: any[] = [];

        // ─── Zod Validation Error ─────────────────────────
        if (exception instanceof ZodError) {
            status = HttpStatus.BAD_REQUEST;
            message = 'Validation failed';
            const zodErrors = exception.issues; // ← .errors වෙනුවට .issues
            errors = zodErrors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            }));
        }

        // ─── NestJS HTTP Exception ────────────────────────
        else if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                const res = exceptionResponse as any;
                message = res.message || message;
                if (Array.isArray(res.message)) {
                    errors = res.message.map((m: string) => ({ message: m }));
                    message = 'Validation failed';
                }
            }
        }

        // ─── Prisma Errors ────────────────────────────────
        else if (exception instanceof Error) {
            const prismaError = exception as any;

            if (prismaError.code === 'P2002') {
                status = HttpStatus.CONFLICT;
                message = `Already exists: ${prismaError.meta?.target?.join(', ')}`;
            } else if (prismaError.code === 'P2025') {
                status = HttpStatus.NOT_FOUND;
                message = 'Record not found';
            } else if (prismaError.code === 'P2003') {
                status = HttpStatus.BAD_REQUEST;
                message = 'Invalid reference: related record not found';
            } else {
                message = exception.message || 'Internal server error';
            }
        }

        // ─── Log ──────────────────────────────────────────
        if (status >= 500) {
            this.logger.error(
                `${request.method} ${request.url} — ${status}`,
                exception instanceof Error ? exception.stack : String(exception),
            );
        } else {
            this.logger.warn(
                `${request.method} ${request.url} — ${status}: ${message}`,
            );
        }

        // ─── Response ─────────────────────────────────────
        response.status(status).json({
            success: false,
            statusCode: status,
            message,
            errors: errors.length > 0 ? errors : undefined,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
}