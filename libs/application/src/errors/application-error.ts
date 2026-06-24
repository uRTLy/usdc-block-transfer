export type ApplicationErrorCode =
  | 'INVALID_QUERY'
  | 'UNSUPPORTED_CHAIN'
  | 'UNSUPPORTED_ASSET'
  | 'BLOCK_TOO_OLD';

export class ApplicationError extends Error {
  constructor(
    readonly code: ApplicationErrorCode,
    message: string,
  ) {
    super(message);
  }
}
