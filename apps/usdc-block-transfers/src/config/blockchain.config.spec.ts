import { getEthereumMaxBlockAge } from './blockchain.config';

describe('getEthereumMaxBlockAge', () => {
  const previousMaxBlockAge = process.env.ETHEREUM_MAX_BLOCK_AGE;

  afterEach(() => {
    if (previousMaxBlockAge === undefined) {
      delete process.env.ETHEREUM_MAX_BLOCK_AGE;
      return;
    }

    process.env.ETHEREUM_MAX_BLOCK_AGE = previousMaxBlockAge;
  });

  it('returns undefined when max block age is not configured', () => {
    delete process.env.ETHEREUM_MAX_BLOCK_AGE;

    expect(getEthereumMaxBlockAge()).toBeUndefined();
  });

  it('returns undefined when max block age is empty', () => {
    process.env.ETHEREUM_MAX_BLOCK_AGE = '';

    expect(getEthereumMaxBlockAge()).toBeUndefined();
  });

  it('parses configured max block age', () => {
    process.env.ETHEREUM_MAX_BLOCK_AGE = '100';

    expect(getEthereumMaxBlockAge()).toBe(100);
  });

  it('rejects invalid max block age', () => {
    process.env.ETHEREUM_MAX_BLOCK_AGE = '-1';

    expect(() => getEthereumMaxBlockAge()).toThrow(
      'ETHEREUM_MAX_BLOCK_AGE must be a non-negative integer',
    );
  });
});
