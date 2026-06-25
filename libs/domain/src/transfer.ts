import {
  requireIntegerString,
  requireNonEmptyString,
  requireNonNegativeInteger,
} from './validation';

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
    requireNonEmptyString(props.chainSlug, 'Transfer chain slug is required');
    requireNonEmptyString(
      props.assetSymbol,
      'Transfer asset symbol is required',
    );
    requireNonEmptyString(props.position, 'Transfer position is required');
    requireNonEmptyString(
      props.transactionHash,
      'Transfer transaction hash is required',
    );
    requireNonEmptyString(props.from, 'Transfer sender is required');
    requireNonEmptyString(props.to, 'Transfer recipient is required');
    requireNonNegativeInteger(
      props.transactionIndex,
      'Transfer transaction index must be a non-negative integer',
    );
    requireNonNegativeInteger(
      props.logIndex,
      'Transfer log index must be a non-negative integer',
    );
    requireIntegerString(
      props.amountRaw,
      'Transfer raw amount must be an integer string',
    );

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
