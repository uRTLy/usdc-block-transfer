import {
  TokenTransferProviderPort,
  TokenTransferProviderSupportInput,
} from './token-transfer-provider.port';

export const TOKEN_TRANSFER_PROVIDER_REGISTRY = Symbol(
  'TOKEN_TRANSFER_PROVIDER_REGISTRY',
);

export interface TokenTransferProviderRegistryPort {
  getProvider(
    input: TokenTransferProviderSupportInput,
  ): TokenTransferProviderPort | null;
}
