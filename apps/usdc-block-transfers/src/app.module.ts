import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ASSET_REGISTRY } from '@app/application';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StaticAssetRegistry } from './asset-registry/static-asset-registry';
import { ApplicationErrorFilter } from './common/application-error.filter';
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
    {
      provide: APP_FILTER,
      useClass: ApplicationErrorFilter,
    },
  ],
})
export class AppModule {}
