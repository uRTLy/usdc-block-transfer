import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ASSET_REGISTRY } from '@app/application';
import { BlockchainEvmModule } from '@app/blockchain-evm';
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
      provide: APP_FILTER,
      useClass: ApplicationErrorFilter,
    },
  ],
})
export class AppModule {}
