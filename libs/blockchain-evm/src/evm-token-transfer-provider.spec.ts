import { Asset, Chain } from '@app/domain';
import { ERC20_TRANSFER_EVENT } from './erc20-transfer-event';
import {
  EvmTokenTransferLogClient,
  EvmTokenTransferProvider,
} from './evm-token-transfer-provider';

describe('EvmTokenTransferProvider', () => {
  it('supports EVM contract assets addressed by block number', () => {
    const provider = new EvmTokenTransferProvider(createClient());

    expect(provider.supports({ chain: ethereum, asset: usdc })).toBe(true);
  });

  it('queries ERC20 Transfer logs for a single block', async () => {
    const getLogs = jest.fn(() => Promise.resolve([]));
    const provider = new EvmTokenTransferProvider({ getLogs });

    await provider.getTransfers({
      chain: ethereum,
      asset: usdc,
      position: '123',
    });

    expect(getLogs).toHaveBeenCalledWith({
      address: usdc.identifier.value,
      event: ERC20_TRANSFER_EVENT,
      fromBlock: 123n,
      toBlock: 123n,
      strict: true,
    });
  });

  it('maps Transfer logs into domain transfers', async () => {
    const provider = new EvmTokenTransferProvider({
      getLogs: jest.fn(() =>
        Promise.resolve([
          {
            transactionHash: transactionHash,
            transactionIndex: 7,
            logIndex: 11,
            args: {
              from: '0x0000000000000000000000000000000000000001',
              to: '0x0000000000000000000000000000000000000002',
              value: 2500000n,
            },
          },
        ]),
      ),
    });

    await expect(
      provider.getTransfers({
        chain: ethereum,
        asset: usdc,
        position: '123',
      }),
    ).resolves.toEqual([
      {
        chainSlug: 'ethereum',
        assetSymbol: 'USDC',
        position: '123',
        transactionHash,
        transactionIndex: 7,
        logIndex: 11,
        from: '0x0000000000000000000000000000000000000001',
        to: '0x0000000000000000000000000000000000000002',
        amountRaw: '2500000',
      },
    ]);
  });
});

const ethereum = new Chain({
  slug: 'ethereum',
  name: 'Ethereum Mainnet',
  family: 'evm',
  positionKind: 'blockNumber',
});

const usdc = new Asset({
  symbol: 'USDC',
  name: 'USD Coin',
  chainSlug: 'ethereum',
  decimals: 6,
  identifier: {
    type: 'contractAddress',
    value: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
});

const transactionHash =
  '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

function createClient(): EvmTokenTransferLogClient {
  return {
    getLogs: jest.fn(() => Promise.resolve([])),
  };
}
