import {
  HttpRequestError,
  InternalRpcError,
  LimitExceededRpcError,
  ResourceUnavailableRpcError,
  TimeoutError,
} from 'viem';
import { mapViemRpcError } from './map-viem-rpc-error';

describe('mapViemRpcError', () => {
  it('maps viem timeout errors', () => {
    const error = mapViemRpcError(
      new TimeoutError({
        body: { method: 'eth_getLogs' },
        url: 'https://example.com',
      }),
    );

    expect(error).toMatchObject({
      code: 'UPSTREAM_RPC_TIMEOUT',
    });
  });

  it('maps HTTP rate limits', () => {
    const error = mapViemRpcError(createHttpError(429));

    expect(error).toMatchObject({
      code: 'UPSTREAM_RPC_RATE_LIMITED',
    });
  });

  it('maps RPC limit errors', () => {
    const error = mapViemRpcError(
      new LimitExceededRpcError(new Error('limit exceeded')),
    );

    expect(error).toMatchObject({
      code: 'UPSTREAM_RPC_RATE_LIMITED',
    });
  });

  it('maps unavailable RPC errors', () => {
    const error = mapViemRpcError(
      new ResourceUnavailableRpcError(new Error('resource unavailable')),
    );

    expect(error).toMatchObject({
      code: 'UPSTREAM_RPC_UNAVAILABLE',
    });
  });

  it('maps internal RPC errors', () => {
    const error = mapViemRpcError(new InternalRpcError(new Error('internal')));

    expect(error).toMatchObject({
      code: 'UPSTREAM_RPC_UNAVAILABLE',
    });
  });

  it('maps unknown errors to bad upstream response', () => {
    const error = mapViemRpcError(new Error('unexpected'));

    expect(error).toMatchObject({
      code: 'UPSTREAM_RPC_BAD_RESPONSE',
    });
  });
});

function createHttpError(status: number): HttpRequestError {
  return new HttpRequestError({
    body: { method: 'eth_getLogs' },
    status,
    url: 'https://example.com',
  });
}
