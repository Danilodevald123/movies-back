import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (
      exception instanceof Error &&
      exception.name === 'QueryFailedError' &&
      exception.message.includes('invalid input syntax for type uuid')
    ) {
      const badRequestException = new BadRequestException(
        'Uno o más IDs proporcionados no son válidos',
      );
      return this.handleHttpException(badRequestException, request, response);
    }

    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, request, response);
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Internal server error',
    };

    this.logger.error(
      `${request.method} ${request.url} - ${status}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(errorResponse);
  }

  private handleHttpException(
    exception: HttpException,
    request: Request,
    response: Response,
  ) {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let errorMessage: string;

    if (typeof exceptionResponse === 'string') {
      errorMessage = exceptionResponse;
    } else {
      const responseObj = exceptionResponse as Record<string, unknown>;

      if (Array.isArray(responseObj.message)) {
        errorMessage = responseObj.message.join(', ');
      } else if (typeof responseObj.message === 'string') {
        errorMessage = responseObj.message;
      } else {
        errorMessage = 'Bad request';
      }
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: errorMessage,
    };

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status}`,
        exception.stack,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - ${status}: ${errorMessage}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
