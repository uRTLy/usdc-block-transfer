import { Asset, Chain } from '@app/domain';

export const SUPPORTED_CHAINS = [
  new Chain({
    slug: 'ethereum',
    name: 'Ethereum Mainnet',
    family: 'evm',
    positionKind: 'blockNumber',
  }),
] as const;

export const SUPPORTED_ASSETS = [
  new Asset({
    symbol: 'USDC',
    name: 'USD Coin',
    chainSlug: 'ethereum',
    decimals: 6,
    identifier: {
      type: 'contractAddress',
      value: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
  }),
] as const;
