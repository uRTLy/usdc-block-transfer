export const ETHEREUM_CHAIN_SLUG = 'ethereum';

const PUBLIC_ETHEREUM_RPC_URL = 'https://ethereum-rpc.publicnode.com';

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
