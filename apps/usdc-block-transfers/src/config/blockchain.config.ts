export const ETHEREUM_CHAIN_SLUG = 'ethereum';

const PUBLIC_ETHEREUM_RPC_URL = 'https://ethereum-rpc.publicnode.com';
const DEFAULT_ETHEREUM_MAX_BLOCK_AGE = 100;

export function getEthereumRpcUrl(): string {
  const rpcUrl = process.env.ETHEREUM_RPC_URL;

  if (rpcUrl) {
    return rpcUrl;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('ETHEREUM_RPC_URL is required');
  }

  return PUBLIC_ETHEREUM_RPC_URL;
}

export function getEthereumMaxBlockAge(): number | undefined {
  const maxBlockAge = process.env.ETHEREUM_MAX_BLOCK_AGE;

  if (maxBlockAge === undefined) {
    return DEFAULT_ETHEREUM_MAX_BLOCK_AGE;
  }

  if (maxBlockAge.trim().length === 0) {
    return undefined;
  }

  const parsedMaxBlockAge = Number(maxBlockAge);

  if (!Number.isInteger(parsedMaxBlockAge) || parsedMaxBlockAge < 0) {
    throw new Error('ETHEREUM_MAX_BLOCK_AGE must be a non-negative integer');
  }

  return parsedMaxBlockAge;
}
