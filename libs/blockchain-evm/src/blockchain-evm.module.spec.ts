import { Test } from '@nestjs/testing';
import { Asset, Chain } from '@app/domain';
import { BlockchainEvmModule } from './blockchain-evm.module';
import { EVM_TOKEN_TRANSFER_PROVIDER } from './blockchain-evm.tokens';
import { EvmTokenTransferProvider } from './evm-token-transfer-provider';

const ethereum = new Chain({
  slug: 'ethereum',
  name: 'Ethereum Mainnet',
  family: 'evm',
  positionKind: 'blockNumber',
});

const polygon = new Chain({
  slug: 'polygon',
  name: 'Polygon',
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

describe('BlockchainEvmModule', () => {
  it('exports configured EVM token transfer provider', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        BlockchainEvmModule.forRoot({
          chainSlug: 'ethereum',
          rpcUrl: 'http://localhost:8545',
        }),
      ],
    }).compile();

    const provider = moduleRef.get<EvmTokenTransferProvider>(
      EVM_TOKEN_TRANSFER_PROVIDER,
    );

    expect(provider).toBeInstanceOf(EvmTokenTransferProvider);
    expect(provider.supports({ chain: ethereum, asset: usdc })).toBe(true);
    expect(provider.supports({ chain: polygon, asset: usdc })).toBe(false);
  });

  it('requires chain slug', async () => {
    await expect(
      Test.createTestingModule({
        imports: [
          BlockchainEvmModule.forRoot({
            chainSlug: '',
            rpcUrl: 'http://localhost:8545',
          }),
        ],
      }).compile(),
    ).rejects.toThrow('Blockchain EVM chain slug is required');
  });

  it('requires RPC URL', async () => {
    await expect(
      Test.createTestingModule({
        imports: [
          BlockchainEvmModule.forRoot({
            chainSlug: 'ethereum',
            rpcUrl: '',
          }),
        ],
      }).compile(),
    ).rejects.toThrow('Blockchain EVM RPC URL is required');
  });

  it('requires max block age to be a non-negative integer', async () => {
    await expect(
      Test.createTestingModule({
        imports: [
          BlockchainEvmModule.forRoot({
            chainSlug: 'ethereum',
            rpcUrl: 'http://localhost:8545',
            maxBlockAge: -1,
          }),
        ],
      }).compile(),
    ).rejects.toThrow(
      'Blockchain EVM max block age must be a non-negative integer',
    );
  });
});
