import { Asset } from './asset';
import { Chain } from './chain';
import { Transfer } from './transfer';

describe('domain', () => {
  it('creates a chain', () => {
    const chain = new Chain({
      slug: 'ethereum',
      name: 'Ethereum Mainnet',
      family: 'evm',
      positionKind: 'blockNumber',
    });

    expect(chain.slug).toBe('ethereum');
  });

  it('creates a chain-specific asset id', () => {
    const asset = new Asset({
      symbol: 'USDC',
      name: 'USD Coin',
      chainSlug: 'ethereum',
      decimals: 6,
      identifier: {
        type: 'contractAddress',
        value: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      },
    });

    expect(asset.id).toBe('ethereum:USDC');
  });

  it('sorts transfers by transaction index and log index', () => {
    const later = new Transfer({
      chainSlug: 'ethereum',
      assetSymbol: 'USDC',
      position: '123',
      transactionHash: '0xlater',
      transactionIndex: 2,
      logIndex: 0,
      from: '0xfrom',
      to: '0xto',
      amountRaw: '100',
    });
    const earlier = new Transfer({
      chainSlug: 'ethereum',
      assetSymbol: 'USDC',
      position: '123',
      transactionHash: '0xearlier',
      transactionIndex: 1,
      logIndex: 4,
      from: '0xfrom',
      to: '0xto',
      amountRaw: '100',
    });

    expect([later, earlier].sort(Transfer.compareByChainOrder)).toEqual([
      earlier,
      later,
    ]);
  });
});
