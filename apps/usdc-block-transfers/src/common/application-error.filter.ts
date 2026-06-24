import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { ApplicationError, ApplicationErrorCode } from '@app/application';

interface ErrorResponse {
  statusCode: number;
  error: ApplicationErrorCode;
  message: string;
}

interface HttpResponse {
  status(statusCode: number): {
    json(body: ErrorResponse): void;
  };
}

@Catch(ApplicationError)
export class ApplicationErrorFilter implements ExceptionFilter<ApplicationError> {
  catch(exception: ApplicationError, host: ArgumentsHost): void {
    const statusCode = getApplicationErrorStatus(exception.code);
    const response = host.switchToHttp().getResponse<HttpResponse>();

    response.status(statusCode).json({
      statusCode,
      error: exception.code,
      message: exception.message,
    });
  }
}

export function getApplicationErrorStatus(
  code: ApplicationErrorCode,
): HttpStatus {
  switch (code) {
    case 'INVALID_QUERY':
      return HttpStatus.BAD_REQUEST;
    case 'BLOCK_TOO_OLD':
      return HttpStatus.UNPROCESSABLE_ENTITY;
    case 'UNSUPPORTED_CHAIN':
    case 'UNSUPPORTED_ASSET':
      return HttpStatus.NOT_FOUND;
  }

  return assertNever(code);
}

function assertNever(value: never): never {
  throw new Error(`Unhandled application error code: ${String(value)}`);
}
