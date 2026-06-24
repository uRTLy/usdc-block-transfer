export interface TransferProps {
  chainSlug: string;
  assetSymbol: string;
  position: string;
  transactionHash: string;
  transactionIndex: number;
  logIndex: number;
  from: string;
  to: string;
  amountRaw: string;
}

export class Transfer {
  readonly chainSlug: string;
  readonly assetSymbol: string;
  readonly position: string;
  readonly transactionHash: string;
  readonly transactionIndex: number;
  readonly logIndex: number;
  readonly from: string;
  readonly to: string;
  readonly amountRaw: string;

  constructor(props: TransferProps) {
    requireNonEmpty(props.chainSlug, 'Transfer chain slug is required');
    requireNonEmpty(props.assetSymbol, 'Transfer asset symbol is required');
    requireNonEmpty(props.position, 'Transfer position is required');
    requireNonEmpty(
      props.transactionHash,
      'Transfer transaction hash is required',
    );
    requireNonEmpty(props.from, 'Transfer sender is required');
    requireNonEmpty(props.to, 'Transfer recipient is required');

    if (
      !Number.isInteger(props.transactionIndex) ||
      props.transactionIndex < 0
    ) {
      throw new Error(
        'Transfer transaction index must be a non-negative integer',
      );
    }

    if (!Number.isInteger(props.logIndex) || props.logIndex < 0) {
      throw new Error('Transfer log index must be a non-negative integer');
    }

    if (!/^\d+$/.test(props.amountRaw)) {
      throw new Error('Transfer raw amount must be an integer string');
    }

    this.chainSlug = props.chainSlug;
    this.assetSymbol = props.assetSymbol;
    this.position = props.position;
    this.transactionHash = props.transactionHash;
    this.transactionIndex = props.transactionIndex;
    this.logIndex = props.logIndex;
    this.from = props.from;
    this.to = props.to;
    this.amountRaw = props.amountRaw;
  }

  static compareByChainOrder(
    this: void,
    left: Transfer,
    right: Transfer,
  ): number {
    if (left.transactionIndex !== right.transactionIndex) {
      return left.transactionIndex - right.transactionIndex;
    }

    return left.logIndex - right.logIndex;
  }
}

function requireNonEmpty(value: string, message: string): void {
  if (value.trim().length === 0) {
    throw new Error(message);
  }
}
