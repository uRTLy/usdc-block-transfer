export type ApplicationErrorCode =
  | 'INVALID_QUERY'
  | 'UNSUPPORTED_CHAIN'
  | 'UNSUPPORTED_ASSET'
  | 'NO_COMPATIBLE_TRANSFER_PROVIDER'
  | 'BLOCK_TOO_OLD'
  | 'UPSTREAM_RPC_TIMEOUT'
  | 'UPSTREAM_RPC_RATE_LIMITED'
  | 'UPSTREAM_RPC_UNAVAILABLE'
  | 'UPSTREAM_RPC_BAD_RESPONSE';

export class ApplicationError extends Error {
  constructor(
    readonly code: ApplicationErrorCode,
    message: string,
  ) {
    super(message);
  }
}
