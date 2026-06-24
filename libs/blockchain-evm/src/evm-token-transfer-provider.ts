import type { Address } from 'viem';
import type { TokenTransferProviderPort } from '@app/application';
import type { Asset, Chain } from '@app/domain';
import { Transfer } from '@app/domain';
import { ERC20_TRANSFER_EVENT } from './erc20-transfer-event';
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
  client: EvmTokenTransferLogClient;
}

export class EvmTokenTransferProvider implements TokenTransferProviderPort {
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
  }
}
