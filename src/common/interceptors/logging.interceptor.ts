import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const url = request.url;
    const body = request.body as Record<string, unknown> | undefined;
    const query = request.query;
    const params = request.params;
    const startTime = Date.now();

    this.logger.log(`→ ${method} ${url}`);

    if (Object.keys(params).length > 0) {
      this.logger.debug(`Params: ${JSON.stringify(params)}`);
    }

    if (Object.keys(query).length > 0) {
      this.logger.debug(`Query: ${JSON.stringify(query)}`);
    }

    if (body && Object.keys(body).length > 0) {
      const sanitizedBody = { ...body };
      if ('password' in sanitizedBody) {
        sanitizedBody.password = '***';
      }
      this.logger.debug(`Body: ${JSON.stringify(sanitizedBody)}`);
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          this.logger.log(`← ${method} ${url} - ${responseTime}ms`);
        },
        error: (error: unknown) => {
          const responseTime = Date.now() - startTime;
          const status =
            error && typeof error === 'object' && 'status' in error
              ? (error as { status: number }).status
              : 500;
          this.logger.error(
            `← ${method} ${url} - ${status} - ${responseTime}ms`,
          );
        },
      }),
    );
  }
}
