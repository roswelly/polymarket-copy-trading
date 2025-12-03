/**
 * Place market orders on Polymarket
 */

import { ClobClient, OrderType, Side } from '@polymarket/clob-client';
import { Wallet } from '@ethersproject/wallet';
import * as dotenv from 'dotenv';

dotenv.config();

export interface MarketOrderParams {
    tokenId: string;
    side: 'BUY' | 'SELL';
    amount: number;  // USDC amount
}

export class MarketOrderExecutor {
    private client: ClobClient;

    constructor(privateKey?: string, host?: string, chainId?: number) {
        const key = privateKey || process.env.PRIVATE_KEY;
        const apiHost = host || process.env.CLOB_API_URL || 'https://clob.polymarket.com';
        const chain = chainId || parseInt(process.env.POLYGON_CHAIN_ID || '137');

        if (!key) {
            throw new Error('Private key not provided');
        }

        const wallet = new Wallet(key);
        this.client = new ClobClient(apiHost, chain, wallet);
    }

    /**
     * Get current market price for market order estimation
     */
    async getMarketPrice(tokenId: string, side: 'BUY' | 'SELL'): Promise<number | null> {
        try {
            const price = await this.client.getPrice(tokenId, side);
            return price ? parseFloat(price) : null;
        } catch (error: any) {
            console.error(`❌ Error getting market price:`, error.message || error);
            return null;
        }
    }

    /**
     * Place a market order using createAndPostOrder
     */
    async placeMarketOrder(params: MarketOrderParams): Promise<any> {
        try {
            console.log('='.repeat(50));
            console.log('📝 Placing Market Order');
            console.log('='.repeat(50));
            console.log(`Token ID: ${params.tokenId.substring(0, 12)}...`);
            console.log(`Side: ${params.side}`);
            console.log(`Amount: ${params.amount} USDC`);
            
            // Get current market price
            const marketPrice = await this.getMarketPrice(params.tokenId, params.side);
            
            if (!marketPrice) {
                throw new Error('Could not get market price');
            }

            console.log(`Market Price: $${marketPrice.toFixed(4)}`);
            
            // Calculate size (shares to buy)
            const size = params.amount / marketPrice;
            console.log(`Estimated Shares: ${size.toFixed(2)}`);
            
            // Place order at market price with slight buffer
            const bufferMultiplier = params.side === 'BUY' ? 1.01 : 0.99; // 1% buffer
            const orderPrice = marketPrice * bufferMultiplier;
            
            console.log(`Order Price (with buffer): $${orderPrice.toFixed(4)}`);
            console.log('\n🔄 Submitting order...\n');

            const order = await this.client.createAndPostOrder({
                tokenID: params.tokenId,
                price: orderPrice,
                size: size,
                side: params.side === 'BUY' ? Side.BUY : Side.SELL,
            },
            { tickSize: '0.001', negRisk: false }, // Default tick size
            OrderType.GTC);

            console.log('✅ Order placed successfully!');
            console.log('Order:', order);
            console.log('='.repeat(50));
            
            return order;
            
        } catch (error: any) {
            console.error('❌ Error placing market order:', error.message || error);
            if (error.transaction) {
                console.error(`Transaction hash: ${error.transaction.hash}`);
            }
            throw error;
        }
    }

    /**
     * Place a limit order
     */
    async placeLimitOrder(
        tokenId: string,
        side: 'BUY' | 'SELL',
        price: number,
        size: number
    ): Promise<any> {
        try {
            console.log('='.repeat(50));
            console.log('📝 Placing Limit Order');
            console.log('='.repeat(50));
            console.log(`Token ID: ${tokenId.substring(0, 12)}...`);
            console.log(`Side: ${side}`);
            console.log(`Price: $${price.toFixed(4)}`);
            console.log(`Size: ${size.toFixed(2)} shares`);
            console.log('\n🔄 Submitting order...\n');

            const order = await this.client.createAndPostOrder({
                tokenID: tokenId,
                price: price,
                size: size,
                side: side === 'BUY' ? Side.BUY : Side.SELL,
            },
            { tickSize: '0.001', negRisk: false },
            OrderType.GTC);

            console.log('✅ Order placed successfully!');
            console.log('Order:', order);
            console.log('='.repeat(50));
            
            return order;
            
        } catch (error: any) {
            console.error('❌ Error placing limit order:', error.message || error);
            if (error.transaction) {
                console.error(`Transaction hash: ${error.transaction.hash}`);
            }
            throw error;
        }
    }

    /**
     * Cancel an order
     */
    async cancelOrder(orderId: string): Promise<any> {
        try {
            console.log(`🔄 Cancelling order ${orderId}...`);
            const result = await this.client.cancelOrder({ orderID: orderId });
            console.log('✅ Order cancelled successfully!');
            return result;
        } catch (error: any) {
            console.error('❌ Error cancelling order:', error.message || error);
            throw error;
        }
    }

    /**
     * Get order status
     */
    async getOrderStatus(orderId: string): Promise<any> {
        try {
            const order = await this.client.getOrder(orderId);
            return order;
        } catch (error: any) {
            console.error('❌ Error getting order status:', error.message || error);
            throw error;
        }
    }

    /**
     * Get all open orders
     */
    async getOpenOrders(): Promise<any[]> {
        try {
            const orders = await this.client.getOpenOrders();
            return orders || [];
        } catch (error: any) {
            console.error('❌ Error getting open orders:', error.message || error);
            return [];
        }
    }
}

// Example usage
if (require.main === module) {
    (async () => {
        try {
            const executor = new MarketOrderExecutor();
            
            // Example: Place a market buy order
            // Uncomment to use:
            /*
            await executor.placeMarketOrder({
                tokenId: 'YOUR_TOKEN_ID',
                side: 'BUY',
                amount: 10  // 10 USDC
            });
            */
            
            console.log('Market order executor initialized');
            console.log('Uncomment code to place orders');
            
        } catch (error) {
            console.error('Error:', error);
            process.exit(1);
        }
    })();
}

