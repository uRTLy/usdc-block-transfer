export type AssetIdentifierType = 'contractAddress';

export interface AssetIdentifier {
  type: AssetIdentifierType;
  value: string;
}

export interface AssetProps {
  symbol: string;
  name: string;
  chainSlug: string;
  decimals: number;
  identifier: AssetIdentifier;
}

export class Asset {
  readonly symbol: string;
  readonly name: string;
  readonly chainSlug: string;
  readonly decimals: number;
  readonly identifier: AssetIdentifier;

  constructor(props: AssetProps) {
    if (props.symbol.trim().length === 0) {
      throw new Error('Asset symbol is required');
    }

    if (props.name.trim().length === 0) {
      throw new Error('Asset name is required');
    }

    if (props.chainSlug.trim().length === 0) {
      throw new Error('Asset chain slug is required');
    }

    if (!Number.isInteger(props.decimals) || props.decimals < 0) {
      throw new Error('Asset decimals must be a non-negative integer');
    }

    if (props.identifier.value.trim().length === 0) {
      throw new Error('Asset identifier value is required');
    }

    this.symbol = props.symbol;
    this.name = props.name;
    this.chainSlug = props.chainSlug;
    this.decimals = props.decimals;
    this.identifier = props.identifier;
  }

  get id(): string {
    return `${this.chainSlug}:${this.symbol}`;
  }

  isOnChain(chainSlug: string): boolean {
    return this.chainSlug === chainSlug;
  }
}
