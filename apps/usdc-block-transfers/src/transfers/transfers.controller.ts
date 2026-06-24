import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApplicationError, ASSET_REGISTRY } from '@app/application';
import type { AssetRegistryPort } from '@app/application';

interface GetTransfersResponse {
  chain: string;
  asset: string;
  blockNumber: string;
  transfers: [];
}

@Controller('v1/transfers')
export class TransfersController {
  constructor(
    @Inject(ASSET_REGISTRY)
    private readonly assetRegistry: AssetRegistryPort,
  ) {}

  @Get()
  async getTransfers(
    @Query('chain') chain: unknown,
    @Query('asset') asset: unknown,
    @Query('blockNumber') blockNumber: unknown,
  ): Promise<GetTransfersResponse> {
    const chainSlug = parseRequiredQueryString('chain', chain).toLowerCase();
    const assetSymbol = parseRequiredQueryString('asset', asset).toUpperCase();
    const block = parseBlockNumber(blockNumber);
    const supportedChain = await this.assetRegistry.findChain(chainSlug);

    if (!supportedChain) {
      throw new ApplicationError(
        'UNSUPPORTED_CHAIN',
        `Unsupported chain: ${chainSlug}`,
      );
    }

    const supportedAsset = await this.assetRegistry.findAsset(
      supportedChain.slug,
      assetSymbol,
    );

    if (!supportedAsset) {
      throw new ApplicationError(
        'UNSUPPORTED_ASSET',
        `Unsupported asset: ${assetSymbol}`,
      );
    }

    return {
      chain: supportedChain.slug,
      asset: supportedAsset.symbol,
      blockNumber: block,
      transfers: [],
    };
  }
}

function parseRequiredQueryString(name: string, value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApplicationError('INVALID_QUERY', `${name} is required`);
  }

  return value.trim();
}

function parseBlockNumber(value: unknown): string {
  const blockNumber = parseRequiredQueryString('blockNumber', value);

  if (!/^\d+$/.test(blockNumber)) {
    throw new ApplicationError(
      'INVALID_QUERY',
      'blockNumber must be a non-negative integer',
    );
  }

  return blockNumber;
}
