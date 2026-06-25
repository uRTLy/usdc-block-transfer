import { HttpStatus } from '@nestjs/common';
import { getApplicationErrorStatus } from './application-error.filter';

describe('getApplicationErrorStatus', () => {
  it.each([
    ['INVALID_QUERY', HttpStatus.BAD_REQUEST],
    ['UNSUPPORTED_CHAIN', HttpStatus.NOT_FOUND],
    ['UNSUPPORTED_ASSET', HttpStatus.NOT_FOUND],
    ['NO_COMPATIBLE_TRANSFER_PROVIDER', HttpStatus.INTERNAL_SERVER_ERROR],
    ['BLOCK_TOO_OLD', HttpStatus.UNPROCESSABLE_ENTITY],
  ] as const)('maps %s to %s', (code, expectedStatus) => {
    expect(getApplicationErrorStatus(code)).toBe(expectedStatus);
  });
});
