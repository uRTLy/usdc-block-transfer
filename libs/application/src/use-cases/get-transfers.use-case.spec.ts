import { Asset, Chain, Transfer } from '@app/domain';
import { ApplicationError } from '../errors/application-error';
import { AssetRegistryPort } from '../ports/asset-registry.port';
import { TokenTransferProviderRegistryPort } from '../ports/token-transfer-provider-registry.port';
import { TokenTransferProviderPort } from '../ports/token-transfer-provider.port';
import { GetTransfersUseCase } from './get-transfers.use-case';

describe('GetTransfersUseCase', () => {
  const chain = new Chain({
    slug: 'ethereum',
    name: 'Ethereum Mainnet',
    family: 'evm',
    positionKind: 'blockNumber',
  });

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

  it('throws an application error when chain is not supported', async () => {
    const useCase = new GetTransfersUseCase(
      createAssetRegistry({ chain: null, asset }),
      createProviderRegistry(null),
    );

    await expect(
      useCase.execute({
        chainSlug: 'unknown',
        assetSymbol: 'USDC',
        position: '123',
      }),
    ).rejects.toMatchObject<ApplicationError>({
      code: 'UNSUPPORTED_CHAIN',
    });
  });

  it('throws an application error when asset is not supported', async () => {
    const useCase = new GetTransfersUseCase(
      createAssetRegistry({ chain, asset: null }),
      createProviderRegistry(null),
    );

    await expect(
      useCase.execute({
        chainSlug: 'ethereum',
        assetSymbol: 'UNKNOWN',
        position: '123',
      }),
    ).rejects.toMatchObject<ApplicationError>({
      code: 'UNSUPPORTED_ASSET',
    });
  });

  it('calls a matching provider with resolved chain and asset', async () => {
    const getTransfers = jest.fn().mockResolvedValue([]);
    const provider = createProvider({ getTransfers });
    const useCase = new GetTransfersUseCase(
      createAssetRegistry({ chain, asset }),
      createProviderRegistry(provider),
    );

    await useCase.execute({
      chainSlug: 'ethereum',
      assetSymbol: 'USDC',
      position: '123',
    });

    expect(getTransfers).toHaveBeenCalledWith({
      chain,
      asset,
      position: '123',
    });
  });

  it('throws an application error when no compatible provider exists', async () => {
    const useCase = new GetTransfersUseCase(
      createAssetRegistry({ chain, asset }),
      createProviderRegistry(null),
    );

    await expect(
      useCase.execute({
        chainSlug: 'ethereum',
        assetSymbol: 'USDC',
        position: '123',
      }),
    ).rejects.toMatchObject<ApplicationError>({
      code: 'NO_COMPATIBLE_TRANSFER_PROVIDER',
      message: 'No token transfer provider configured for ethereum:USDC',
    });
  });

  it('returns transfers sorted by transaction index and log index', async () => {
    const secondTransfer = createTransfer({
      transactionIndex: 1,
      logIndex: 0,
    });
    const firstTransfer = createTransfer({
      transactionIndex: 0,
      logIndex: 4,
    });
    const thirdTransfer = createTransfer({
      transactionIndex: 1,
      logIndex: 2,
    });

    const useCase = new GetTransfersUseCase(
      createAssetRegistry({ chain, asset }),
      createProviderRegistry(
        createProvider({
          getTransfers: jest
            .fn()
            .mockResolvedValue([thirdTransfer, secondTransfer, firstTransfer]),
        }),
      ),
    );

    await expect(
      useCase.execute({
        chainSlug: 'ethereum',
        assetSymbol: 'USDC',
        position: '123',
      }),
    ).resolves.toEqual([firstTransfer, secondTransfer, thirdTransfer]);
  });
});

function createAssetRegistry(input: {
  chain: Chain | null;
  asset: Asset | null;
}): AssetRegistryPort {
  return {
    listChains: jest.fn(),
    listAssets: jest.fn(),
    findChain: jest.fn().mockResolvedValue(input.chain),
    findAsset: jest.fn().mockResolvedValue(input.asset),
  };
}

function createProviderRegistry(
  provider: TokenTransferProviderPort | null,
): TokenTransferProviderRegistryPort {
  return {
    getProvider: jest.fn().mockReturnValue(provider),
  };
}

function createProvider(input: {
  getTransfers: TokenTransferProviderPort['getTransfers'];
}): TokenTransferProviderPort {
  return {
    supports: jest.fn(),
    getTransfers: input.getTransfers,
  };
}

function createTransfer(input: {
  transactionIndex: number;
  logIndex: number;
}): Transfer {
  return new Transfer({
    chainSlug: 'ethereum',
    assetSymbol: 'USDC',
    position: '123',
    transactionHash: `0x${input.transactionIndex}${input.logIndex}`,
    transactionIndex: input.transactionIndex,
    logIndex: input.logIndex,
    from: '0xfrom',
    to: '0xto',
    amountRaw: '1000000',
  });
}
