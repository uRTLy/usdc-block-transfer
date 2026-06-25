import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { Asset, Chain } from '@app/domain';
import { EvmTokenTransferProvider } from './evm-token-transfer-provider';

const LIVE_ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL;
const describeLive =
  process.env.RUN_LIVE_RPC_TESTS === 'true' && LIVE_ETHEREUM_RPC_URL
    ? describe
    : describe.skip;

const LIVE_USDC_TRANSFER_BLOCK = '25388697';

describeLive('EvmTokenTransferProvider live RPC smoke test', () => {
  // This test sends a real JSON-RPC request to Ethereum mainnet.
  // Run it manually with RUN_LIVE_RPC_TESTS=true and ETHEREUM_RPC_URL set to
  // an RPC endpoint that allows historical eth_getLogs requests.
  it('reads USDC Transfer logs from a known Ethereum block', async () => {
    const client = createPublicClient({
      chain: mainnet,
      transport: http(LIVE_ETHEREUM_RPC_URL),
    });
    const provider = new EvmTokenTransferProvider({
      chainSlug: 'ethereum',
      expectedChainId: mainnet.id,
      client: {
        getChainId: () => client.getChainId(),
        getBlockNumber: () => client.getBlockNumber(),
        getLogs: (input) => client.getLogs(input),
      },
    });

    const transfers = await provider.getTransfers({
      chain: ethereum,
      asset: usdc,
      position: LIVE_USDC_TRANSFER_BLOCK,
    });

    expect(transfers.length).toBeGreaterThan(0);
    expect(transfers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          chainSlug: 'ethereum',
          assetSymbol: 'USDC',
          position: LIVE_USDC_TRANSFER_BLOCK,
          transactionHash:
            '0xd6cd42f88df9d42fa202ea3de29c626d220550908d563d19cc116575fa453108',
          transactionIndex: 0,
          logIndex: 1,
          amountRaw: '4269151440',
        }),
      ]),
    );
  }, 30_000);
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
