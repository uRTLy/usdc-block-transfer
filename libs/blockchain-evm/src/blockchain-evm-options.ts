import type { Chain as ViemChain } from 'viem';

export interface BlockchainEvmModuleOptions {
  chainSlug: string;
  rpcUrl: string;
  viemChain?: ViemChain;
  maxBlockAge?: number;
}
