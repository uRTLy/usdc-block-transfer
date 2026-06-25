import type { Address } from 'viem';
import {
  ApplicationError,
  type TokenTransferProviderPort,
} from '@app/application';
import type { Asset, Chain } from '@app/domain';
import { Transfer } from '@app/domain';
import { ERC20_TRANSFER_EVENT } from './erc20-transfer-event';
import { mapViemRpcError } from './utils/map-viem-rpc-error';
import { isEvmAddress } from './utils/is-evm-address';
import {
  requireBigInt,
  requireNumber,
  requireString,
} from './utils/required-log-fields';

export interface EvmTransferLog {
  transactionHash: string | null;
  transactionIndex: number | null;
  logIndex: number | null;
  args?: {
    from?: string;
    to?: string;
    value?: bigint;
  };
}

export interface EvmTokenTransferLogClient {
  getChainId(): Promise<number>;
  getBlockNumber(): Promise<bigint>;
  getLogs(input: {
    address: Address;
    event: typeof ERC20_TRANSFER_EVENT;
    fromBlock: bigint;
    toBlock: bigint;
    strict: true;
  }): Promise<EvmTransferLog[]>;
}

export interface EvmTokenTransferProviderOptions {
  chainSlug: string;
  expectedChainId?: number;
  client: EvmTokenTransferLogClient;
  maxBlockAge?: number;
}

export class EvmTokenTransferProvider implements TokenTransferProviderPort {
  private chainIdCheck?: Promise<void>;

  constructor(private readonly options: EvmTokenTransferProviderOptions) {}

  supports(input: { chain: Chain; asset: Asset }): boolean {
    return (
      input.chain.slug === this.options.chainSlug &&
      input.chain.family === 'evm' &&
      input.chain.positionKind === 'blockNumber' &&
      input.asset.identifier.type === 'contractAddress' &&
      isEvmAddress(input.asset.identifier.value)
    );
  }

  async getTransfers(input: {
    chain: Chain;
    asset: Asset;
    position: string;
  }): Promise<Transfer[]> {
    if (!this.supports(input)) {
      throw new Error(
        `Unsupported EVM transfer request: ${input.chain.slug}:${input.asset.symbol}`,
      );
    }

    const blockNumber = BigInt(input.position);

    try {
      await this.assertChainId(input.chain);
      await this.assertBlockAvailability(input.chain, blockNumber);

      const logs = await this.options.client.getLogs({
        address: input.asset.identifier.value as Address,
        event: ERC20_TRANSFER_EVENT,
        fromBlock: blockNumber,
        toBlock: blockNumber,
        strict: true,
      });

      return logs.map(
        (log) =>
          new Transfer({
            chainSlug: input.chain.slug,
            assetSymbol: input.asset.symbol,
            position: input.position,
            transactionHash: requireString(
              log.transactionHash,
              'transactionHash',
            ),
            transactionIndex: requireNumber(
              log.transactionIndex,
              'transactionIndex',
            ),
            logIndex: requireNumber(log.logIndex, 'logIndex'),
            from: requireString(log.args?.from, 'from'),
            to: requireString(log.args?.to, 'to'),
            amountRaw: requireBigInt(log.args?.value, 'value').toString(),
          }),
      );
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }

      throw mapViemRpcError(error);
    }
  }

  private assertChainId(chain: Chain): Promise<void> {
    const expectedChainId = this.options.expectedChainId;

    if (expectedChainId === undefined) {
      return Promise.resolve();
    }

    this.chainIdCheck ??= this.options.client.getChainId().then(
      (actualChainId) => {
        if (actualChainId === expectedChainId) {
          return;
        }

        throw new ApplicationError(
          'UPSTREAM_RPC_BAD_RESPONSE',
          `Configured ${chain.slug} RPC returned chain id ${actualChainId.toString()}, expected ${expectedChainId.toString()}. Check ETHEREUM_RPC_URL.`,
        );
      },
      (error: unknown) => {
        this.chainIdCheck = undefined;
        throw error;
      },
    );

    return this.chainIdCheck;
  }

  private async assertBlockAvailability(
    chain: Chain,
    blockNumber: bigint,
  ): Promise<void> {
    const latestBlock = await this.options.client.getBlockNumber();

    if (blockNumber > latestBlock) {
      throw new ApplicationError(
        'BLOCK_NOT_AVAILABLE',
        `Block ${blockNumber.toString()} is not available on ${chain.slug} yet. Latest block is ${latestBlock.toString()}.`,
      );
    }

    const maxBlockAge = this.options.maxBlockAge;

    if (maxBlockAge === undefined) {
      return;
    }

    const maxBlockAgeBigInt = BigInt(maxBlockAge);
    const oldestAcceptedBlock =
      latestBlock > maxBlockAgeBigInt ? latestBlock - maxBlockAgeBigInt : 0n;

    if (blockNumber >= oldestAcceptedBlock) {
      return;
    }

    throw new ApplicationError(
      'BLOCK_TOO_OLD',
      `Block ${blockNumber.toString()} is too old for the configured ${chain.slug} RPC. Oldest accepted block is ${oldestAcceptedBlock.toString()}, latest block is ${latestBlock.toString()}.`,
    );
  }
}
