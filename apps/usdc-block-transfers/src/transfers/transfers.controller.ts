import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApplicationError, GetTransfersUseCase } from '@app/application';
import type { Transfer } from '@app/domain';

type GetTransfersHandler = Pick<GetTransfersUseCase, 'execute'>;

interface TransferResponse {
  transactionHash: string;
  transactionIndex: number;
  logIndex: number;
  from: string;
  to: string;
  amountRaw: string;
}

interface GetTransfersResponse {
  chain: string;
  asset: string;
  assetDecimals: number;
  blockNumber: string;
  transfers: TransferResponse[];
}

@Controller('v1/transfers')
export class TransfersController {
  constructor(
    @Inject(GetTransfersUseCase)
    private readonly getTransfersUseCase: GetTransfersHandler,
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
    const result = await this.getTransfersUseCase.execute({
      chainSlug,
      assetSymbol,
      position: block,
    });

    return {
      chain: result.chain.slug,
      asset: result.asset.symbol,
      assetDecimals: result.asset.decimals,
      blockNumber: result.position,
      transfers: result.transfers.map(toTransferResponse),
    };
  }
}

function toTransferResponse(transfer: Transfer): TransferResponse {
  return {
    transactionHash: transfer.transactionHash,
    transactionIndex: transfer.transactionIndex,
    logIndex: transfer.logIndex,
    from: transfer.from,
    to: transfer.to,
    amountRaw: transfer.amountRaw,
  };
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
