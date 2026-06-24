import type { Asset, Chain } from '@app/domain';

export const ASSET_REGISTRY = Symbol('ASSET_REGISTRY');

export interface AssetRegistryPort {
  listChains(): Promise<Chain[]>;
  listAssets(): Promise<Asset[]>;
  findChain(chainSlug: string): Promise<Chain | null>;
  findAsset(chainSlug: string, assetSymbol: string): Promise<Asset | null>;
}
