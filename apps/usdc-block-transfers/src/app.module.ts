import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import {
  ASSET_REGISTRY,
  GetTransfersUseCase,
  TOKEN_TRANSFER_PROVIDER_REGISTRY,
  TOKEN_TRANSFER_PROVIDERS,
  type AssetRegistryPort,
  type TokenTransferProviderPort,
  type TokenTransferProviderRegistryPort,
} from '@app/application';
import {
  BlockchainEvmModule,
  EVM_TOKEN_TRANSFER_PROVIDER,
} from '@app/blockchain-evm';
import { mainnet } from 'viem/chains';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StaticAssetRegistry } from './asset-registry/static-asset-registry';
import { ApplicationErrorFilter } from './common/application-error.filter';
import {
  ETHEREUM_CHAIN_SLUG,
  getEthereumRpcUrl,
} from './config/blockchain.config';
import {
  SUPPORTED_ASSETS,
  SUPPORTED_CHAINS,
} from './config/supported-assets.config';
import { TransfersController } from './transfers/transfers.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BlockchainEvmModule.forRoot({
      chainSlug: ETHEREUM_CHAIN_SLUG,
      rpcUrl: getEthereumRpcUrl(),
      viemChain: mainnet,
    }),
  ],
  controllers: [AppController, TransfersController],
  providers: [
    AppService,
    {
      provide: ASSET_REGISTRY,
      useFactory: () =>
        new StaticAssetRegistry({
          chains: SUPPORTED_CHAINS,
          assets: SUPPORTED_ASSETS,
        }),
    },
    {
      provide: TOKEN_TRANSFER_PROVIDERS,
      useFactory: (
        evmProvider: TokenTransferProviderPort,
      ): TokenTransferProviderPort[] => [evmProvider],
      inject: [EVM_TOKEN_TRANSFER_PROVIDER],
    },
    {
      provide: TOKEN_TRANSFER_PROVIDER_REGISTRY,
      useFactory: (
        providers: TokenTransferProviderPort[],
      ): TokenTransferProviderRegistryPort => ({
        getProvider: ({ chain, asset }) =>
          providers.find((provider) => provider.supports({ chain, asset })) ??
          null,
      }),
      inject: [TOKEN_TRANSFER_PROVIDERS],
    },
    {
      provide: GetTransfersUseCase,
      useFactory: (
        assetRegistry: AssetRegistryPort,
        providerRegistry: TokenTransferProviderRegistryPort,
      ) => new GetTransfersUseCase(assetRegistry, providerRegistry),
      inject: [ASSET_REGISTRY, TOKEN_TRANSFER_PROVIDER_REGISTRY],
    },
    {
      provide: APP_FILTER,
      useClass: ApplicationErrorFilter,
    },
  ],
})
export class AppModule {}
