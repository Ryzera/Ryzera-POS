import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
    timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T>
    implements NestInterceptor<T, ApiResponse<T>> {

    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<ApiResponse<T>> {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const statusCode = response.statusCode;

        return next.handle().pipe(
            map((data) => ({
                success: true,
                statusCode,
                message: this.getDefaultMessage(statusCode),
                data,
                timestamp: new Date().toISOString(),
            })),
        );
    }

    private getDefaultMessage(statusCode: number): string {
        const messages: Record<number, string> = {
            200: 'Success',
            201: 'Created successfully',
            204: 'Deleted successfully',
        };
        return messages[statusCode] || 'Success';
    }
}