import {
  BaseError,
  HttpRequestError,
  InternalRpcError,
  LimitExceededRpcError,
  ResourceUnavailableRpcError,
  TimeoutError,
} from 'viem';
import { ApplicationError } from '@app/application';

export function mapViemRpcError(error: unknown): ApplicationError {
  if (findNestedError(error, isTimeoutError)) {
    return new ApplicationError(
      'UPSTREAM_RPC_TIMEOUT',
      'Ethereum RPC request timed out. Try again later.',
    );
  }

  const httpError = findNestedError(error, isHttpRequestError);

  if (httpError) {
    if (httpError.status === 408 || httpError.status === 504) {
      return new ApplicationError(
        'UPSTREAM_RPC_TIMEOUT',
        'Ethereum RPC request timed out. Try again later.',
      );
    }

    if (httpError.status === 429) {
      return new ApplicationError(
        'UPSTREAM_RPC_RATE_LIMITED',
        'Ethereum RPC rate limit was reached. Try again later or configure another RPC provider.',
      );
    }

    if (
      httpError.status === 403 ||
      httpError.status === 500 ||
      httpError.status === 502 ||
      httpError.status === 503
    ) {
      return new ApplicationError(
        'UPSTREAM_RPC_UNAVAILABLE',
        'Ethereum RPC is currently unavailable. Try again later or configure another RPC provider.',
      );
    }
  }

  if (findNestedError(error, isLimitExceededRpcError)) {
    return new ApplicationError(
      'UPSTREAM_RPC_RATE_LIMITED',
      'Ethereum RPC limit was reached. Try again later or configure another RPC provider.',
    );
  }

  if (
    findNestedError(error, isResourceUnavailableRpcError) ||
    findNestedError(error, isInternalRpcError)
  ) {
    return new ApplicationError(
      'UPSTREAM_RPC_UNAVAILABLE',
      'Ethereum RPC is currently unavailable. Try again later or configure another RPC provider.',
    );
  }

  return new ApplicationError(
    'UPSTREAM_RPC_BAD_RESPONSE',
    'Ethereum RPC returned an unexpected response.',
  );
}

function findNestedError<T extends Error>(
  error: unknown,
  isExpectedError: (error: unknown) => error is T,
): T | null {
  if (isExpectedError(error)) {
    return error;
  }

  if (error instanceof BaseError) {
    const nestedError = error.walk(isExpectedError);

    return isExpectedError(nestedError) ? nestedError : null;
  }

  return null;
}

function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError;
}

function isHttpRequestError(error: unknown): error is HttpRequestError {
  return error instanceof HttpRequestError;
}

function isLimitExceededRpcError(
  error: unknown,
): error is LimitExceededRpcError {
  return error instanceof LimitExceededRpcError;
}

function isResourceUnavailableRpcError(
  error: unknown,
): error is ResourceUnavailableRpcError {
  return error instanceof ResourceUnavailableRpcError;
}

function isInternalRpcError(error: unknown): error is InternalRpcError {
  return error instanceof InternalRpcError;
}
