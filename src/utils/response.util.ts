import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class ApiResponse<T> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;

    constructor(statusCode: number, data: T, message: string = 'Success') {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
        return next.handle().pipe(
            map((data) => {
                const response = context.switchToHttp().getResponse();
                const statusCode = response.statusCode || 200;

                // If the data is already an ApiResponse, return it as is
                if (data instanceof ApiResponse) {
                    return data;
                }

                // If it's an error response, handle differently
                if (statusCode >= 400) {
                    return new ApiResponse(statusCode, null, data?.message || 'Error');
                }

                // For successful responses
                return new ApiResponse(statusCode, data, 'Success');
            }),
        );
    }
}

// Utility functions for manual response handling
export const successResponse = <T>(
    data: T,
    message: string = 'Success',
    statusCode: number = 200
): ApiResponse<T> => {
    return new ApiResponse(statusCode, data, message);
};

export const errorResponse = (
    message: string = 'Internal Server Error',
    statusCode: number = 500
): ApiResponse<null> => {
    return new ApiResponse(statusCode, null, message);
};