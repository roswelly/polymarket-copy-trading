# Polymarket Copy Trading Bot | Polymarket Arbitrage Bot
A **polymarket copy trading bot** that monitors a target wallet and mirrors its trades from your proxy wallet, with basic risk controls. Built with **TypeScript** on **Node.js**, and executes via Polymarket’s **Central Limit Order Book (CLOB)** API.

---

## Consult

For consulting, feel free to reach out to me fore latest version with new strategey and also can implement your own strategy with rust and python:

**Telegram**: [@roswellecho](https://t.me/roswellecho)

## Support Me

If you find this bot helpful and profitable, I am really appreciate your support! Consider sending 11% of your profits to help maintain and improve this project:

**Wallet Address:** `DXxfenpMYgSngc7vfqQknK6ptUbubUVJRFUBh94Doywa`

---

## Performance (PNL Snapshots)

https://polygonscan.com/tx/0x8e1f82c30744f2df068f22d145371164f2ea237beaa55dde6ca4f022afe397cf
<img width="352" height="222" src="https://github.com/user-attachments/assets/294c51f5-d531-450c-904c-9c19e0184a23" />
<img width="290" height="201" src="https://github.com/user-attachments/assets/2b7633a6-d9f1-43f2-a14d-ba79f9c147b2" />
<img width="351" height="223" src="https://github.com/user-attachments/assets/7b7ad783-98b5-4b10-a0a7-166e90f56589" />\
<img width="442" height="257" src="https://github.com/user-attachments/assets/92674dca-76e8-4591-8b4b-54a7c5d4c39b" />


---

## System Architecture

### Technology Stack

* **Runtime**: Node.js 18+
* **Language**: TypeScript (v5.7+)
* **Blockchain**: Polygon (Ethereum-compatible L2)
* **Web3**: Ethers.js v5
* **APIs**:
  * `@polymarket/clob-client` - Polymarket CLOB trading client
  * Polymarket Data API - For fetching activities and positions
* **Utilities**: Axios, Mongoose, Ora (spinners)

### High-Level Flow

```
Polymarket Data API (HTTP Polling)
        ↓
Trade Monitor (Fetches & Validates Trades)
        ↓
MongoDB (Stores Trade History)
        ↓
Trade Executor (Reads Pending Trades)
        ↓
Position Analysis (Compares Wallets)
        ↓
CLOB Client (Executes Orders)
        ↓
Order Execution (Buy/Sell/Merge Strategies)
```

---

## Quickstart

### Prerequisites

- **Node.js** 18+ (npm included)
- **MongoDB** (local or remote)
- **Polygon wallet** funded with USDC (this bot trades from your proxy wallet)

### Setup Steps

1. **Clone the repository:**
```bash
git clone <repository-url>
cd polymarket-trading-bot
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment configuration:**

Copy `env.example` to `.env` and fill in real values:

```bash
# macOS / Linux
cp env.example .env
```

```powershell
# Windows PowerShell
Copy-Item env.example .env
```

Then edit `.env` and set at least:

- `USER_ADDRESS`: wallet to copy
- `PROXY_WALLET`: your wallet that places orders
- `PRIVATE_KEY`: private key for `PROXY_WALLET` (**64 hex chars, no `0x` prefix**)
- `MONGO_URI`: Mongo connection string

6. **(Optional) Validate the repo + env wiring:**

```bash
node validate-bot.js
```

7. **Start the bot:**
```bash
# Development mode (with ts-node)
npm run dev

# Or build and run
npm run build
npm start
```

### Important security note

This bot currently **stores your proxy wallet private key in MongoDB** (see `src/index.ts`). Only run it on machines and databases you fully control, and treat the DB as sensitive as your key.

---

## ⚙️ Configuration Reference

| Variable              | Description                                    | Required |
| --------------------- | ---------------------------------------------- | -------- |
| `USER_ADDRESS`        | Target wallet address to copy trades from      | Yes      |
| `PROXY_WALLET`        | Your wallet address that executes trades       | Yes      |
| `PRIVATE_KEY`         | Your wallet private key (64 hex, no 0x)        | Yes      |
| `CLOB_HTTP_URL`       | Polymarket CLOB HTTP API endpoint              | Yes      |
| `CLOB_WS_URL`         | Polymarket WebSocket endpoint                  | Yes      |
| `RPC_URL`             | Polygon RPC endpoint                           | Yes      |
| `USDC_CONTRACT_ADDRESS` | USDC token contract on Polygon              | Yes      |
| `FETCH_INTERVAL`      | Trade monitoring interval (seconds)             | No (default: 1) |
| `TOO_OLD_TIMESTAMP`   | Ignore trades older than X hours                | No (default: 24) |
| `RETRY_LIMIT`         | Maximum retry attempts for failed trades        | No (default: 3) |

---

## Usage

### Start Copy Trading

```bash
npm run dev
```

### Expected Output

When running successfully, you should see:
```
Target User Wallet address is: 0x...
My Wallet address is: 0x...
API Key created/derived
Trade Monitor is running every 1 seconds
Executing Copy Trading
Waiting for new transactions...
```
### Trade Execution Flow

1. **Monitor**: Fetches user activities from Polymarket API
2. **Filter**: Identifies new TRADE type activities
3. **Execute**: Reads pending trades and determines action (buy/sell/merge)
4. **Match**: Compares positions between target wallet and your wallet
5. **Trade**: Executes orders via CLOB client
---

## Execution Logic

### Trade Lifecycle

1. **Fetch Activities**: Monitor target wallet via Polymarket Data API
2. **Filter Trades**: Identify TRADE type activities only
3. **Check Duplicates**: Verify trade hasn't been processed before
4. **Validate Timestamp**: Ignore trades older than configured threshold
5. **Fetch Positions**: Get current positions for both wallets
6. **Get Balances**: Check USDC balances for both wallets
7. **Determine Condition**: Decide on buy/sell/merge based on positions
8. **Execute Order**: Place order via CLOB client using appropriate strategy

### Trading Strategies

* **Buy Strategy**: When target wallet buys, calculate position size based on balance ratio
* **Sell Strategy**: When target wallet sells, match the sell proportionally
* **Merge Strategy**: When target wallet closes position but you still hold, sell your position
* **Error Handling**: Retry failed orders up to RETRY_LIMIT, then mark as failed

---

## Project Structure

```
src/
 ├── index.ts                 # Main entry point
 ├── config/
 │   └── env.ts               # Environment variables
 ├── services/
 │   ├── tradeMonitor.ts      # Monitors target wallet trades
 │   ├── tradeExecutor.ts     # Executes copy trades
 │   └── createClobClient.ts # Alternative CLOB client (unused)
 ├── utils/
 │   ├── createClobClient.ts  # CLOB client initialization
 │   ├── fetchData.ts         # HTTP data fetching
 │   ├── getMyBalance.ts      # USDC balance checker
 │   ├── postOrder.ts         # Order execution logic
 │   └── spinner.ts           # Terminal spinner
 ├── models/
 │   └── userHistory.ts       # MongoDB schemas
 ├── interfaces/
 │   └── User.ts              # TypeScript interfaces
 └── test/
     └── test.ts              # Test utilities
```

---

## Logging & Monitoring

* Trade detection and execution
* Balance and allowance checks
* Redemption outcomes
* Structured logs for debugging and audits

Log levels: `info`, `success`, `warning`, `error`

---

## Risk Disclosure

* Copy trading amplifies both profits and losses
* Liquidity and slippage risks apply
* Gas fees incurred on every transaction
* WebSocket or API outages may impact execution

**Best Practices**:

* Start with low multipliers
* Enforce strict max order sizes
* Monitor balances regularly
* Test using dry-run modes

---

## Development

```bash
# Type check
npm run build

# Run in development mode
npm run dev

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

---


### Key Features

* Real-time trade monitoring and execution
* Intelligent position matching and sizing
* Automatic retry mechanisms for failed orders
* MongoDB-based trade history tracking
* Support for multiple market types

---

## Troubleshooting

### Common Issues

1. **"USER_ADDRESS is not defined"**
   - Check your `.env` file exists and has all required variables

2. **"Cannot find module '@polymarket/clob-client'"**
   - Run `npm install` to install dependencies

3. **"invalid hexlify value"**
   - Check `PRIVATE_KEY` is 64 hex characters without `0x` prefix

4. **"API Key creation failed"**
   - Verify `PRIVATE_KEY` matches `PROXY_WALLET`
   - Ensure wallet has proper permissions

---

## License

MIT
