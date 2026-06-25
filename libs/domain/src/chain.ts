import { requireNonEmptyString } from './validation';

export type ChainFamily = 'evm';
export type PositionKind = 'blockNumber';

export interface ChainProps {
  slug: string;
  name: string;
  family: ChainFamily;
  positionKind: PositionKind;
}

export class Chain {
  readonly slug: string;
  readonly name: string;
  readonly family: ChainFamily;
  readonly positionKind: PositionKind;

  constructor(props: ChainProps) {
    requireNonEmptyString(props.slug, 'Chain slug is required');
    requireNonEmptyString(props.name, 'Chain name is required');

    this.slug = props.slug;
    this.name = props.name;
    this.family = props.family;
    this.positionKind = props.positionKind;
  }
}
