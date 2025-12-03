/**
 * Get best bid and ask prices from order book
 */

import { ClobClient } from '@polymarket/clob-client';
import { Wallet } from '@ethersproject/wallet';
import * as dotenv from 'dotenv';

dotenv.config();

export interface BidAsk {
    bid: number | null;
    ask: number | null;
    midpoint: number | null;
    spread: number | null;
}

export class BidAsker {
    private client: ClobClient;

    constructor(privateKey?: string, host?: string, chainId?: number) {
        // For read-only operations, we can use a dummy wallet
        const key = privateKey || process.env.PRIVATE_KEY || '0x' + '1'.repeat(64);
        const apiHost = host || process.env.CLOB_API_URL || 'https://clob.polymarket.com';
        const chain = chainId || parseInt(process.env.POLYGON_CHAIN_ID || '137');

        const wallet = new Wallet(key);
        this.client = new ClobClient(apiHost, chain, wallet);
    }

    /**
     * Get order book for a token
     */
    async getOrderBook(tokenId: string): Promise<any> {
        try {
            const orderBook = await this.client.getOrderBook(tokenId);
            return orderBook;
        } catch (error: any) {
            console.error(`❌ Error fetching order book for ${tokenId}:`, error.message || error);
            return null;
        }
    }

    /**
     * Get best bid and ask from order book
     */
    async getBestBidAsk(tokenId: string): Promise<BidAsk> {
        try {
            const orderBook = await this.getOrderBook(tokenId);
            
            if (!orderBook) {
                return { bid: null, ask: null, midpoint: null, spread: null };
            }

            const bids = orderBook.bids || [];
            const asks = orderBook.asks || [];

            const bestBid = bids.length > 0 ? parseFloat(bids[0].price) : null;
            const bestAsk = asks.length > 0 ? parseFloat(asks[0].price) : null;

            let midpoint = null;
            let spread = null;

            if (bestBid !== null && bestAsk !== null) {
                midpoint = (bestBid + bestAsk) / 2;
                spread = bestAsk - bestBid;
            }

            return {
                bid: bestBid,
                ask: bestAsk,
                midpoint,
                spread
            };
        } catch (error: any) {
            console.error(`❌ Error getting bid/ask:`, error.message || error);
            return { bid: null, ask: null, midpoint: null, spread: null };
        }
    }

    /**
     * Get midpoint price
     */
    async getMidpoint(tokenId: string): Promise<number | null> {
        try {
            const midpoint = await this.client.getMidpoint(tokenId);
            return midpoint ? parseFloat(midpoint) : null;
        } catch (error: any) {
            console.error(`❌ Error fetching midpoint:`, error.message || error);
            return null;
        }
    }

    /**
     * Get last trade price
     */
    async getLastTradePrice(tokenId: string): Promise<number | null> {
        try {
            const lastPrice = await this.client.getLastTradePrice(tokenId);
            return lastPrice ? parseFloat(lastPrice) : null;
        } catch (error: any) {
            console.error(`❌ Error fetching last trade price:`, error.message || error);
            return null;
        }
    }

    /**
     * Get comprehensive price data
     */
    async getPriceData(tokenId: string): Promise<{
        bidAsk: BidAsk;
        midpoint: number | null;
        lastTrade: number | null;
    }> {
        const [bidAsk, midpoint, lastTrade] = await Promise.all([
            this.getBestBidAsk(tokenId),
            this.getMidpoint(tokenId),
            this.getLastTradePrice(tokenId)
        ]);

        return { bidAsk, midpoint, lastTrade };
    }

    /**
     * Display price information
     */
    displayPriceInfo(tokenId: string, data: any): void {
        console.log('='.repeat(50));
        console.log(`Token: ${tokenId.substring(0, 12)}...`);
        console.log('='.repeat(50));
        
        if (data.bidAsk.bid !== null) {
            console.log(`📉 Best Bid:    $${data.bidAsk.bid.toFixed(4)}`);
        }
        if (data.bidAsk.ask !== null) {
            console.log(`📈 Best Ask:    $${data.bidAsk.ask.toFixed(4)}`);
        }
        if (data.bidAsk.midpoint !== null) {
            console.log(`💰 Midpoint:    $${data.bidAsk.midpoint.toFixed(4)}`);
        }
        if (data.bidAsk.spread !== null) {
            console.log(`📊 Spread:      $${data.bidAsk.spread.toFixed(4)} (${(data.bidAsk.spread * 100).toFixed(2)}%)`);
        }
        if (data.lastTrade !== null) {
            console.log(`🔄 Last Trade:  $${data.lastTrade.toFixed(4)}`);
        }
        
        console.log('='.repeat(50));
    }
}

// Example usage
if (require.main === module) {
    (async () => {
        try {
            const tokenId = process.argv[2];
            
            if (!tokenId) {
                console.log('Usage: ts-node src/bid_asker.ts <token_id>');
                process.exit(1);
            }

            const bidAsker = new BidAsker();
            const data = await bidAsker.getPriceData(tokenId);
            bidAsker.displayPriceInfo(tokenId, data);
            
        } catch (error) {
            console.error('Error:', error);
            process.exit(1);
        }
    })();
}

