import { HttpStatus } from '@nestjs/common';
import { getApplicationErrorStatus } from './application-error.filter';

describe('getApplicationErrorStatus', () => {
  it.each([
    ['INVALID_QUERY', HttpStatus.BAD_REQUEST],
    ['UNSUPPORTED_CHAIN', HttpStatus.NOT_FOUND],
    ['UNSUPPORTED_ASSET', HttpStatus.NOT_FOUND],
  ] as const)('maps %s to %s', (code, expectedStatus) => {
    expect(getApplicationErrorStatus(code)).toBe(expectedStatus);
  });
});
