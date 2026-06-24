export function requireString(
  value: string | null | undefined,
  name: string,
): string {
  if (!value) {
    throw new Error(`Missing ${name} in EVM transfer log`);
  }

  return value;
}

export function requireNumber(
  value: number | null | undefined,
  name: string,
): number {
  if (typeof value !== 'number') {
    throw new Error(`Missing ${name} in EVM transfer log`);
  }

  return value;
}

export function requireBigInt(value: bigint | undefined, name: string): bigint {
  if (typeof value !== 'bigint') {
    throw new Error(`Missing ${name} in EVM transfer log`);
  }

  return value;
}
