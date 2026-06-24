import { isAddress } from 'viem';
import type { Address } from 'viem';

export function isEvmAddress(value: string): value is Address {
  return isAddress(value);
}
