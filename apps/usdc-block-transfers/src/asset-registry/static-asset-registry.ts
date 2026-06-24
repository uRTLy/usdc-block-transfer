import { AssetRegistryPort } from '@app/application';
import { Asset, Chain } from '@app/domain';

export interface StaticAssetRegistryOptions {
  chains: readonly Chain[];
  assets: readonly Asset[];
}

export class StaticAssetRegistry implements AssetRegistryPort {
  constructor(private readonly options: StaticAssetRegistryOptions) {}

  listChains(): Promise<Chain[]> {
    return Promise.resolve([...this.options.chains]);
  }

  listAssets(): Promise<Asset[]> {
    return Promise.resolve([...this.options.assets]);
  }

  findChain(chainSlug: string): Promise<Chain | null> {
    const slug = chainSlug.trim().toLowerCase();

    return Promise.resolve(
      this.options.chains.find((chain) => chain.slug === slug) ?? null,
    );
  }

  findAsset(chainSlug: string, assetSymbol: string): Promise<Asset | null> {
    const slug = chainSlug.trim().toLowerCase();
    const symbol = assetSymbol.trim().toUpperCase();

    return Promise.resolve(
      this.options.assets.find(
        (asset) => asset.chainSlug === slug && asset.symbol === symbol,
      ) ?? null,
    );
  }
}
