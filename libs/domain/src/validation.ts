export function requireNonEmptyString(value: string, message: string): void {
  if (value.trim().length === 0) {
    throw new Error(message);
  }
}

export function requireNonNegativeInteger(
  value: number,
  message: string,
): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(message);
  }
}

export function requireIntegerString(value: string, message: string): void {
  if (!/^\d+$/.test(value)) {
    throw new Error(message);
  }
}
