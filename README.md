# Polymarket Trading Bot | Polymarket Arbitrage Bot

A TypeScript-based trading bot for Polymarket prediction markets on Polygon. This bot provides both interactive and automated trading capabilities with comprehensive market analysis, order management, and risk controls.

## Features

- **Interactive Trading Interface**: Command-line menu for manual trading operations
- **Automated Trading**: Real-time price monitoring and automated trade execution
- **Market Discovery**: Automatic Bitcoin market detection and search
- **Price Analysis**: Real-time bid/ask, midpoint, and spread calculations
- **Order Management**: Market orders, limit orders, and order cancellation
- **Balance Monitoring**: USDC and MATIC balance checking with trading readiness validation
- **Allowance Management**: Token allowance checking and approval
- **WebSocket Integration**: Real-time price feeds from external sources and Polymarket
- **Risk Management**: Configurable stop-loss and take-profit orders
- **Read-Only Mode**: Safe exploration without private key

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Polygon wallet with USDC and MATIC
- Polymarket account (optional for read-only mode)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd confidential-spl-token
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Configure your environment variables (see Configuration section)

## Configuration

Create a `.env` file with the following variables:

### Required (for trading)
```env
PRIVATE_KEY=0xYourPrivateKeyHere
```

### Optional
```env
# API Endpoints
CLOB_API_URL=https://clob.polymarket.com
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_CHAIN_ID=137
GAMMA_API_URL=https://gamma-api.polymarket.com

# WebSocket Endpoints
SOFTWARE_WS_URL=ws://45.130.166.119:5001
POLYMARKET_WS_URL=wss://ws-subscriptions-clob.polymarket.com/ws/market

# Trading Parameters
PRICE_DIFFERENCE_THRESHOLD=0.015
STOP_LOSS_AMOUNT=0.005
TAKE_PROFIT_AMOUNT=0.01
TRADE_COOLDOWN=30
DEFAULT_TRADE_AMOUNT=5.0

# Balance Requirements
MIN_USDC_BALANCE=5.0
MIN_MATIC_BALANCE=0.05

# Logging
LOG_LEVEL=INFO
LOG_TO_FILE=false

# WebSocket Reconnection
MAX_RECONNECT_ATTEMPTS=10
BASE_RECONNECT_DELAY=5000
MAX_RECONNECT_DELAY=60000
```

## Usage

### Interactive Mode

Start the interactive trading bot:
```bash
npm run dev
```

The bot will display a menu with the following options:

**With Private Key (Full Mode):**
1. Show Credentials
2. Check Balances (USDC + MATIC)
3. Check Allowance
4. Set Allowance
5. Find Current Bitcoin Market
6. Get Price Data (Bid/Ask)
7. Place Market Order
8. Place Limit Order
9. View Open Orders
10. Cancel Order
0. Exit

**Without Private Key (Read-Only Mode):**
5. Find Current Bitcoin Market
6. Get Price Data (Bid/Ask)
0. Exit

### Automated Trading

Start the automated trading bot:
```bash
npm run auto-trade
```

The automated bot will:
- Connect to price feeds via WebSocket
- Monitor price differences between software predictions and Polymarket
- Execute trades when threshold is met
- Automatically place stop-loss and take-profit orders
- Monitor balances periodically

### Utility Scripts

```bash
# Check wallet balances
npm run check-balance

# Generate API credentials
npm run gen-creds

# Check/set token allowance
npm run allowance

# Get bid/ask prices for a token
npm run bid-ask <token_id>

# Find markets
npm run market

# Place orders (example usage)
npm run order
```

## Project Structure

```
confidential-spl-token/
├── src/
│   ├── main.ts                 # Interactive CLI bot
│   ├── auto_trading_bot.ts    # Automated trading bot
│   ├── generate_credentials.ts # CLOB API credential generator
│   ├── credential_generator.ts # Credential utility
│   ├── balance_checker.ts     # Balance checking
│   ├── check_balance.ts       # Standalone balance checker
│   ├── allowance.ts           # Token allowance management
│   ├── bid_asker.ts           # Price data fetcher
│   ├── market_finder.ts       # Market discovery
│   ├── market_order.ts        # Order execution
│   ├── logger.ts              # Logging utility
│   └── config.ts              # Configuration management
├── package.json
├── tsconfig.json
└── .env                        # Environment variables (not in repo)
```

## Getting Started

### 1. Generate API Credentials

First, generate your Polymarket CLOB API credentials:
```bash
npm run gen-creds
```

This will create a `.credentials.json` file with your API keys.

### 2. Check Your Balance

Verify you have sufficient funds:
```bash
npm run check-balance
```

You need:
- At least $5.00 USDC for trading
- At least 0.05 MATIC for gas fees

### 3. Set Token Allowance

Before trading, approve USDC spending:
```bash
npm run allowance
```

Or use the interactive menu (option 4).

### 4. Start Trading

**Interactive Mode:**
```bash
npm run dev
```

**Automated Mode:**
```bash
npm run auto-trade
```

## Security

⚠️ **IMPORTANT SECURITY NOTES:**

1. **Never commit your `.env` file** - It contains your private key
2. **Never commit `.credentials.json`** - It contains API keys
3. **Keep your private key secure** - Anyone with access can control your wallet
4. **Use a dedicated trading wallet** - Don't use your main wallet
5. **Start with small amounts** - Test thoroughly before larger trades
6. **Review all transactions** - Verify before confirming trades

The `.gitignore` file is configured to exclude sensitive files.

## Trading Strategy (Automated Bot)

The automated bot implements an arbitrage strategy:

1. **Price Monitoring**: Continuously monitors prices from:
   - External software WebSocket feed
   - Polymarket market data

2. **Opportunity Detection**: Detects when price difference exceeds threshold

3. **Trade Execution**:
   - Places market buy order
   - Sets take-profit order (default: +$0.01)
   - Sets stop-loss order (default: -$0.005)

4. **Risk Management**:
   - Cooldown between trades (default: 30 seconds)
   - Balance monitoring
   - Automatic reconnection on WebSocket failures

## Troubleshooting

### "Private key not provided"
- Ensure `PRIVATE_KEY` is set in your `.env` file
- Check that the private key starts with `0x`

### "Insufficient funds"
- Fund your wallet with USDC on Polygon
- Ensure you have MATIC for gas fees
- Use `npm run check-balance` to verify

### "RPC is not valid"
- Check your internet connection
- Verify `POLYGON_RPC_URL` is correct
- Try a different RPC endpoint

### WebSocket connection issues
- Check firewall settings
- Verify WebSocket URLs are correct
- The bot will automatically retry with exponential backoff

### "Allowance insufficient"
- Run `npm run allowance` to set allowance
- Or use the interactive menu (option 4)
- You can set "max" for unlimited allowance

## Development

### Build
```bash
npm run build
```

### Run compiled version
```bash
npm start
```

### TypeScript Configuration
The project uses TypeScript with strict mode enabled. Configuration is in `tsconfig.json`.

## Dependencies

- `@polymarket/clob-client` - Polymarket CLOB API client
- `ethers` / `@ethersproject/*` - Blockchain interaction
- `axios` - HTTP requests
- `ws` - WebSocket connections
- `dotenv` - Environment variable management

## License

ISC

## Disclaimer

This software is provided as-is for educational and research purposes. Trading cryptocurrencies and prediction markets involves substantial risk. Always:

- Test thoroughly with small amounts
- Understand the risks involved
- Never trade more than you can afford to lose
- Review all code before using with real funds
- Use at your own risk

The authors are not responsible for any losses incurred from using this software.

## Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Happy Trading! 🚀**

