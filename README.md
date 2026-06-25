# USDC Block Transfers API

NestJS API for reading ERC-20 `Transfer` events for supported assets in a single Ethereum block.

Transfer amounts are returned as raw strings. The response includes token decimals for display conversion.

## Requirements

- Node.js
- npm
- Ethereum JSON-RPC endpoint

## Setup

```bash
npm install
```

Create local environment variables if you do not want to use the built-in development default:

```bash
cp .env.example .env
```

Available variables:

```bash
ETHEREUM_RPC_URL=https://ethereum-rpc.publicnode.com
PORT=3000

# Optional. Use it when the configured RPC only supports recent logs.
# ETHEREUM_MAX_BLOCK_AGE=100
```

`ETHEREUM_RPC_URL` is required in production. In development, the app falls back to a public Ethereum RPC endpoint.

## Running

Default start:

```bash
npm run start
```

Watch mode:

```bash
npm run start:dev
```

Quick start against a public free RPC:

```bash
npm run start:free-rpc
```

This starts the API on port `3017` with:

```bash
ETHEREUM_RPC_URL=https://ethereum-rpc.publicnode.com
```

## API

### Get transfers

```http
GET /v1/transfers?chain=ethereum&asset=USDC&blockNumber=25394458
```

Example:

```bash
curl 'http://localhost:3017/v1/transfers?chain=ethereum&asset=USDC&blockNumber=25394458'
```

Response shape:

```json
{
  "chain": "ethereum",
  "asset": "USDC",
  "assetDecimals": 6,
  "blockNumber": "25394458",
  "transfers": [
    {
      "transactionHash": "0x...",
      "transactionIndex": 4,
      "logIndex": 15,
      "from": "0x...",
      "to": "0x...",
      "amountRaw": "1498276981"
    }
  ]
}
```

## RPC Notes

Public RPC endpoints are useful for quick manual checks, but they are not a production guarantee. They may be rate limited, unavailable, or reject historical `eth_getLogs` requests.

For old Ethereum blocks, use an RPC provider that explicitly supports historical logs. A local node can also work, but only if it retains the historical block bodies and receipts needed for `eth_getLogs`. A pruned node may not be enough for arbitrary old blocks.

If your provider only supports recent blocks, configure:

```bash
ETHEREUM_MAX_BLOCK_AGE=100
```

The API will then reject older blocks before sending the log query to the RPC provider.

## Tests

```bash
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run lint
```

There is also an opt-in live RPC smoke test. It sends a real request to Ethereum mainnet, so keep it outside normal CI:

```bash
RUN_LIVE_RPC_TESTS=true ETHEREUM_RPC_URL=https://your-rpc.example npm test -- --runInBand evm-token-transfer-provider.live.spec.ts
```
