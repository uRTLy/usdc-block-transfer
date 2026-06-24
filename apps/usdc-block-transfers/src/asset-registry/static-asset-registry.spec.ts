import {
  SUPPORTED_ASSETS,
  SUPPORTED_CHAINS,
} from '../config/supported-assets.config';
import { StaticAssetRegistry } from './static-asset-registry';

describe('StaticAssetRegistry', () => {
  it('finds Ethereum mainnet', async () => {
    const registry = createRegistry();

    await expect(registry.findChain('ethereum')).resolves.toMatchObject({
      slug: 'ethereum',
      family: 'evm',
      positionKind: 'blockNumber',
    });
  });

  it('finds Ethereum USDC', async () => {
    const registry = createRegistry();

    await expect(registry.findAsset('ethereum', 'usdc')).resolves.toMatchObject(
      {
        symbol: 'USDC',
        chainSlug: 'ethereum',
        decimals: 6,
        identifier: {
          type: 'contractAddress',
          value: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        },
      },
    );
  });

  it('returns null for unsupported values', async () => {
    const registry = createRegistry();

    await expect(registry.findChain('polygon')).resolves.toBeNull();
    await expect(registry.findAsset('ethereum', 'DAI')).resolves.toBeNull();
  });

  it('does not contain duplicated assets on the same chain', () => {
    const ids = SUPPORTED_ASSETS.map(
      (asset) => `${asset.chainSlug}:${asset.symbol}`,
    );

    expect(new Set(ids).size).toBe(ids.length);
  });
});

function createRegistry(): StaticAssetRegistry {
  return new StaticAssetRegistry({
    chains: SUPPORTED_CHAINS,
    assets: SUPPORTED_ASSETS,
  });
}
