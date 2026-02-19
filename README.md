# Polymarket Copy Trading Bot | Polymarket Trading Bot

A **polymarket copy trading bot** that monitors a target wallet and mirrors its trades from your proxy wallet, via Polymarket **Central Limit Order Book (CLOB)** API.
It also has it's own strategy for trading on 5m, 15m, 1h crypto markets

---

## Performance

<img width="463" height="194" alt="image" src="https://github.com/user-attachments/assets/97c5b62c-9a2a-47f3-b899-32ea45f6e34b" />
<img width="458" height="193" alt="image" src="https://github.com/user-attachments/assets/d9825078-bbcc-41f6-b51c-982eeb8b8595" />
<img width="466" height="193" alt="image" src="https://github.com/user-attachments/assets/906e4b31-5284-4518-88a2-07fa7b305713" />
T
his is snapshort for copy trading with top traders on polyomarket. The was the most perfect result ever among test so far.
Now working on performance improvement since got discovered pitfall
not perfect now but it's stable with decent result

---
## Configuration Reference

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

### Start Copy Trading

```bash
npm run dev
```
### Trading Strategies

Those screenshot is for copy trading bots. It copies some of top traders trading on polymarket. 
I just dive into polymarketk trading bots since December last year. 
it can copy any  trading bots on crypto market across, btc, eth, xrp, btc etc
now I am trying to make this copy trading bots on every markets like events, sports, tech, cultuer etc.
In a meanwhile I am working on my own polymarket trading bots on crypto markets current.
My pnl comes to $830 a day and stable for a 1 week and now just got severe volatiliy.
It leads to lose my pnl.
There are still room for completion of my strategies.
I am open to discuss strategies and also bot performance upgrade and collaboration.
And Current my copy trading bot is for sale and trading bot is on devving (can sell).
Let's keep grinding together

* **Buy Strategy**: When target wallet buys, calculate position size based on balance ratio
* **Sell Strategy**: When target wallet sells, match the sell proportionally
* **Merge Strategy**: When target wallet closes position but you still hold, sell your position
* **Error Handling**: Retry failed orders up to RETRY_LIMIT, then mark as failed
---


---
Now working on latest version if you need latest one let's chat on telegram [@roswellecho](https://t.me/roswellecho)
