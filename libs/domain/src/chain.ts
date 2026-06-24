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
    if (props.slug.trim().length === 0) {
      throw new Error('Chain slug is required');
    }

    if (props.name.trim().length === 0) {
      throw new Error('Chain name is required');
    }

    this.slug = props.slug;
    this.name = props.name;
    this.family = props.family;
    this.positionKind = props.positionKind;
  }
}
