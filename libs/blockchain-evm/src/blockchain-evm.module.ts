import { DynamicModule, Module } from '@nestjs/common';
import { createPublicClient, http } from 'viem';
import type { Provider } from '@nestjs/common';
import type { BlockchainEvmModuleOptions } from './blockchain-evm-options';
import { EVM_TOKEN_TRANSFER_PROVIDER } from './blockchain-evm.tokens';
import { EvmTokenTransferProvider } from './evm-token-transfer-provider';

@Module({})
export class BlockchainEvmModule {
  static forRoot(options: BlockchainEvmModuleOptions): DynamicModule {
    const provider: Provider<EvmTokenTransferProvider> = {
      provide: EVM_TOKEN_TRANSFER_PROVIDER,
      useFactory: () => {
        assertOptions(options);

        const publicClient = createPublicClient({
          chain: options.viemChain,
          transport: http(options.rpcUrl),
        });

        return new EvmTokenTransferProvider({
          chainSlug: options.chainSlug,
          expectedChainId: options.expectedChainId ?? options.viemChain?.id,
          maxBlockAge: options.maxBlockAge,
          client: {
            getChainId: () => publicClient.getChainId(),
            getBlockNumber: () => publicClient.getBlockNumber(),
            getLogs: (input) => publicClient.getLogs(input),
          },
        });
      },
    };

    return {
      module: BlockchainEvmModule,
      providers: [provider],
      exports: [EVM_TOKEN_TRANSFER_PROVIDER],
    };
  }
}

function assertOptions(options: BlockchainEvmModuleOptions): void {
  if (options.chainSlug.trim().length === 0) {
    throw new Error('Blockchain EVM chain slug is required');
  }

  if (options.rpcUrl.trim().length === 0) {
    throw new Error('Blockchain EVM RPC URL is required');
  }

  if (
    options.maxBlockAge !== undefined &&
    (!Number.isInteger(options.maxBlockAge) || options.maxBlockAge < 0)
  ) {
    throw new Error(
      'Blockchain EVM max block age must be a non-negative integer',
    );
  }

  if (
    options.expectedChainId !== undefined &&
    (!Number.isInteger(options.expectedChainId) || options.expectedChainId < 0)
  ) {
    throw new Error(
      'Blockchain EVM expected chain id must be a non-negative integer',
    );
  }
}
