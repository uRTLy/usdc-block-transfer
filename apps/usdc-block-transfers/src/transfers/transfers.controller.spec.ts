import { BadRequestException } from '@nestjs/common';
import { TransfersController } from './transfers.controller';

describe('TransfersController', () => {
  it('returns an empty transfer list for a valid request', () => {
    const controller = new TransfersController();

    expect(controller.getTransfers(' Ethereum ', ' usdc ', '123')).toEqual({
      chain: 'ethereum',
      asset: 'USDC',
      blockNumber: '123',
      transfers: [],
    });
  });

  it.each([
    ['chain', undefined, 'USDC', '123'],
    ['asset', 'ethereum', undefined, '123'],
    ['blockNumber', 'ethereum', 'USDC', undefined],
    ['blockNumber', 'ethereum', 'USDC', '-1'],
    ['blockNumber', 'ethereum', 'USDC', 'abc'],
  ])(
    'throws bad request for invalid %s',
    (_field, chain, asset, blockNumber) => {
      const controller = new TransfersController();

      expect(() => controller.getTransfers(chain, asset, blockNumber)).toThrow(
        BadRequestException,
      );
    },
  );
});
