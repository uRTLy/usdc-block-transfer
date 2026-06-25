export type ApplicationErrorCode =
  | 'INVALID_QUERY'
  | 'UNSUPPORTED_CHAIN'
  | 'UNSUPPORTED_ASSET'
  | 'NO_COMPATIBLE_TRANSFER_PROVIDER'
  | 'BLOCK_TOO_OLD';

export class ApplicationError extends Error {
  constructor(
    readonly code: ApplicationErrorCode,
    message: string,
  ) {
    super(message);
  }
}
