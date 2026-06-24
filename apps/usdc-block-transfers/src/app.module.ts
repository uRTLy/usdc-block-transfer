import { Module } from '@nestjs/common';
import { ASSET_REGISTRY } from '@app/application';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StaticAssetRegistry } from './asset-registry/static-asset-registry';
import {
  SUPPORTED_ASSETS,
  SUPPORTED_CHAINS,
} from './config/supported-assets.config';
import { TransfersController } from './transfers/transfers.controller';

@Module({
  imports: [],
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
  ],
})
export class AppModule {}
