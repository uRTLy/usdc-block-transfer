export type ApplicationErrorCode =
  | 'INVALID_QUERY'
  | 'UNSUPPORTED_CHAIN'
  | 'UNSUPPORTED_ASSET';

export class ApplicationError extends Error {
  constructor(
    readonly code: ApplicationErrorCode,
    message: string,
  ) {
    super(message);
  }
}
