import { requireNonEmptyString, requireNonNegativeInteger } from './validation';

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
    requireNonEmptyString(props.symbol, 'Asset symbol is required');
    requireNonEmptyString(props.name, 'Asset name is required');
    requireNonEmptyString(props.chainSlug, 'Asset chain slug is required');
    requireNonNegativeInteger(
      props.decimals,
      'Asset decimals must be a non-negative integer',
    );
    requireNonEmptyString(
      props.identifier.value,
      'Asset identifier value is required',
    );

    this.symbol = props.symbol;
    this.name = props.name;
    this.chainSlug = props.chainSlug;
    this.decimals = props.decimals;
    this.identifier = props.identifier;
  }
}
