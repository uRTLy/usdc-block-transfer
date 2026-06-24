import { ApplicationError, AssetRegistryPort } from '@app/application';
import { TransfersController } from './transfers.controller';

describe('TransfersController', () => {
  it('returns an empty transfer list for a valid request', async () => {
    const controller = new TransfersController(createAssetRegistry());

    await expect(
      controller.getTransfers(' Ethereum ', ' usdc ', '123'),
    ).resolves.toEqual({
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
    'throws application error for invalid %s',
    async (_field, chain, asset, blockNumber) => {
      const controller = new TransfersController(createAssetRegistry());

      await expect(
        controller.getTransfers(chain, asset, blockNumber),
      ).rejects.toThrow(ApplicationError);
    },
  );

  it('throws application error for unsupported chain', async () => {
    const controller = new TransfersController(createAssetRegistry());

    await expect(
      controller.getTransfers('polygon', 'USDC', '123'),
    ).rejects.toMatchObject({
      code: 'UNSUPPORTED_CHAIN',
    });
  });

  it('throws application error for unsupported asset', async () => {
    const controller = new TransfersController(createAssetRegistry());

    await expect(
      controller.getTransfers('ethereum', 'DAI', '123'),
    ).rejects.toMatchObject({
      code: 'UNSUPPORTED_ASSET',
    });
  });
});

function createAssetRegistry(): AssetRegistryPort {
  return {
    listChains: jest.fn(),
    listAssets: jest.fn(),
    findChain: jest.fn((chainSlug: string) => {
      if (chainSlug !== 'ethereum') {
        return Promise.resolve(null);
      }

      return Promise.resolve({
        slug: 'ethereum',
        name: 'Ethereum Mainnet',
        family: 'evm',
        positionKind: 'blockNumber',
      });
    }),
    findAsset: jest.fn((chainSlug: string, assetSymbol: string) => {
      if (chainSlug !== 'ethereum' || assetSymbol !== 'USDC') {
        return Promise.resolve(null);
      }

      return Promise.resolve({
        symbol: 'USDC',
        name: 'USD Coin',
        chainSlug: 'ethereum',
        decimals: 6,
        identifier: {
          type: 'contractAddress',
          value: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        },
      });
    }),
  };
}
