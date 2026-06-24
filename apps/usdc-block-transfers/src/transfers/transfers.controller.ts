import { BadRequestException, Controller, Get, Query } from '@nestjs/common';

interface GetTransfersResponse {
  chain: string;
  asset: string;
  blockNumber: string;
  transfers: [];
}

@Controller('v1/transfers')
export class TransfersController {
  @Get()
  getTransfers(
    @Query('chain') chain: unknown,
    @Query('asset') asset: unknown,
    @Query('blockNumber') blockNumber: unknown,
  ): GetTransfersResponse {
    const chainSlug = parseRequiredQueryString('chain', chain).toLowerCase();
    const assetSymbol = parseRequiredQueryString('asset', asset).toUpperCase();
    const block = parseBlockNumber(blockNumber);

    return {
      chain: chainSlug,
      asset: assetSymbol,
      blockNumber: block,
      transfers: [],
    };
  }
}

function parseRequiredQueryString(name: string, value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new BadRequestException(`${name} is required`);
  }

  return value.trim();
}

function parseBlockNumber(value: unknown): string {
  const blockNumber = parseRequiredQueryString('blockNumber', value);

  if (!/^\d+$/.test(blockNumber)) {
    throw new BadRequestException('blockNumber must be a non-negative integer');
  }

  return blockNumber;
}
