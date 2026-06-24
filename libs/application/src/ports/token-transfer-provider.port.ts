import { Asset, Chain, Transfer } from '@app/domain';

export const TOKEN_TRANSFER_PROVIDERS = Symbol('TOKEN_TRANSFER_PROVIDERS');

export interface TokenTransferProviderSupportInput {
  chain: Chain;
  asset: Asset;
}

export interface GetTokenTransfersInput {
  chain: Chain;
  asset: Asset;
  position: string;
}

export interface TokenTransferProviderPort {
  supports(input: TokenTransferProviderSupportInput): boolean;
  getTransfers(input: GetTokenTransfersInput): Promise<Transfer[]>;
}
