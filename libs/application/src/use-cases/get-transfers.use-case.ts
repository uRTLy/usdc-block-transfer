import { Transfer } from '@app/domain';
import { ApplicationError } from '../errors/application-error';
import { AssetRegistryPort } from '../ports/asset-registry.port';
import { TokenTransferProviderRegistryPort } from '../ports/token-transfer-provider-registry.port';

export interface GetTransfersInput {
  chainSlug: string;
  assetSymbol: string;
  position: string;
}

export class GetTransfersUseCase {
  constructor(
    private readonly assetRegistry: AssetRegistryPort,
    private readonly transferProviderRegistry: TokenTransferProviderRegistryPort,
  ) {}

  async execute(input: GetTransfersInput): Promise<Transfer[]> {
    const chain = await this.assetRegistry.findChain(input.chainSlug);

    if (!chain) {
      throw new ApplicationError(
        'UNSUPPORTED_CHAIN',
        `Unsupported chain: ${input.chainSlug}`,
      );
    }

    const asset = await this.assetRegistry.findAsset(
      chain.slug,
      input.assetSymbol,
    );

    if (!asset) {
      throw new ApplicationError(
        'UNSUPPORTED_ASSET',
        `Unsupported asset: ${input.assetSymbol}`,
      );
    }

    const provider = this.transferProviderRegistry.getProvider({
      chain,
      asset,
    });

    if (!provider) {
      throw new Error(
        `No token transfer provider configured for ${chain.slug}:${asset.symbol}`,
      );
    }

    const transfers = await provider.getTransfers({
      chain,
      asset,
      position: input.position,
    });

    return transfers.toSorted(Transfer.compareByChainOrder);
  }
}
