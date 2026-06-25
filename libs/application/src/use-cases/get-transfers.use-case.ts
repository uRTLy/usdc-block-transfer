import { Asset, Chain, Transfer } from '@app/domain';
import { ApplicationError } from '../errors/application-error';
import { AssetRegistryPort } from '../ports/asset-registry.port';
import { TokenTransferProviderRegistryPort } from '../ports/token-transfer-provider-registry.port';

export interface GetTransfersInput {
  chainSlug: string;
  assetSymbol: string;
  position: string;
}

export interface GetTransfersResult {
  chain: Chain;
  asset: Asset;
  position: string;
  transfers: Transfer[];
}

export class GetTransfersUseCase {
  constructor(
    private readonly assetRegistry: AssetRegistryPort,
    private readonly transferProviderRegistry: TokenTransferProviderRegistryPort,
  ) {}

  async execute(input: GetTransfersInput): Promise<GetTransfersResult> {
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
      throw new ApplicationError(
        'NO_COMPATIBLE_TRANSFER_PROVIDER',
        `No token transfer provider configured for ${chain.slug}:${asset.symbol}`,
      );
    }

    const transfers = await provider.getTransfers({
      chain,
      asset,
      position: input.position,
    });

    return {
      chain,
      asset,
      position: input.position,
      transfers: transfers.toSorted(Transfer.compareByChainOrder),
    };
  }
}
