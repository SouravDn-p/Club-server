import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../types/global-api-response.Type';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? this.getErrorMessage(exception)
        : exception instanceof Error
          ? exception.message
          : 'Internal server error';

    const error =
      exception instanceof HttpException
        ? exception.name
        : 'InternalServerError';

    this.logger.error(
      `[UNHANDLED ERROR] ${request.method} ${request.url} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const errorResponse: ApiResponse<null> = {
      statusCode: status,
      success: false,
      message,
      data: null,
      meta: {
        path: request.url,
        method: request.method,
        timestamp: new Date().toISOString(),
        error,
      },
    };

    response.status(status).json(errorResponse);
  }

  private getErrorMessage(exception: HttpException): string {
    const response = exception.getResponse();
    if (typeof response === 'string') return response;
    const res = response as ApiResponse<null>;
    if (Array.isArray(res.message)) return res.message.join(', ');
    return res.message || exception.message;
  }
}
