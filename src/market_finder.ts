/**
 * Find and auto-detect Polymarket markets
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

export interface Market {
    slug: string;
    question: string;
    conditionId: string;
    tokens: Token[];
    url: string;
}

export interface Token {
    tokenId: string;
    outcome: string;
    price?: number;
}

export class MarketFinder {
    private gammaApiUrl: string;

    constructor(gammaApiUrl?: string) {
        this.gammaApiUrl = gammaApiUrl || 'https://gamma-api.polymarket.com';
    }

    /**
     * Generate Bitcoin market URL based on current time
     */
    generateBitcoinMarketUrl(): { url: string; slug: string } {
        const now = new Date();
        
        // Convert to ET (UTC-5 for EST, UTC-4 for EDT)
        const month = now.getUTCMonth() + 1;
        const isDST = month > 3 && month < 11;
        const etOffset = isDST ? -4 : -5;
        
        const etDate = new Date(now.getTime() + etOffset * 60 * 60 * 1000);
        
        const monthName = etDate.toLocaleString('en-US', { month: 'long' }).toLowerCase();
        const day = etDate.getUTCDate();
        const hour = etDate.getUTCHours();
        
        // Convert hour to 12-hour format
        let timeStr: string;
        if (hour === 0) {
            timeStr = '12am';
        } else if (hour < 12) {
            timeStr = `${hour}am`;
        } else if (hour === 12) {
            timeStr = '12pm';
        } else {
            timeStr = `${hour - 12}pm`;
        }
        
        const slug = `bitcoin-up-or-down-${monthName}-${day}-${timeStr}-et`;
        const url = `https://polymarket.com/event/${slug}`;
        
        return { url, slug };
    }

    /**
     * Fetch market data by slug
     */
    async fetchMarketBySlug(slug: string): Promise<Market | null> {
        try {
            const response = await axios.get(`${this.gammaApiUrl}/markets`, {
                params: { slug }
            });

            const data = response.data;
            let market: any;

            if (Array.isArray(data) && data.length > 0) {
                market = data[0];
            } else if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                market = data.data[0];
            } else if (data.results && Array.isArray(data.results) && data.results.length > 0) {
                market = data.results[0];
            } else if (typeof data === 'object') {
                market = data;
            }

            if (!market) {
                return null;
            }

            return this.parseMarket(market);
            
        } catch (error: any) {
            console.error(`❌ Error fetching market:`, error.message || error);
            return null;
        }
    }

    /**
     * Parse market data into standard format
     */
    private parseMarket(marketData: any): Market {
        const tokens: Token[] = [];

        if (marketData.tokens && Array.isArray(marketData.tokens)) {
            for (const token of marketData.tokens) {
                tokens.push({
                    tokenId: token.token_id || token.tokenId,
                    outcome: token.outcome,
                    price: token.price ? parseFloat(token.price) : undefined
                });
            }
        }

        // Identify UP and DOWN tokens
        const upToken = tokens.find(t => 
            t.outcome.toLowerCase().includes('up') || 
            t.outcome.toLowerCase().includes('yes') ||
            t.outcome.toLowerCase().includes('higher')
        );
        
        const downToken = tokens.find(t => 
            t.outcome.toLowerCase().includes('down') || 
            t.outcome.toLowerCase().includes('no') ||
            t.outcome.toLowerCase().includes('lower')
        );

        return {
            slug: marketData.slug,
            question: marketData.question,
            conditionId: marketData.condition_id || marketData.conditionId,
            tokens: [upToken, downToken].filter(Boolean) as Token[],
            url: `https://polymarket.com/event/${marketData.slug}`
        };
    }

    /**
     * Find current Bitcoin market
     */
    async findCurrentBitcoinMarket(): Promise<Market | null> {
        const { slug } = this.generateBitcoinMarketUrl();
        console.log(`🔍 Searching for Bitcoin market: ${slug}`);
        
        const market = await this.fetchMarketBySlug(slug);
        
        if (market) {
            console.log('✅ Market found!');
            this.displayMarket(market);
        } else {
            console.log('❌ Market not found');
        }
        
        return market;
    }

    /**
     * Search active markets
     */
    async searchActiveMarkets(query: string = 'bitcoin'): Promise<Market[]> {
        try {
            const response = await axios.get(`${this.gammaApiUrl}/markets`, {
                params: {
                    active: true,
                    closed: false,
                    limit: 50
                }
            });

            const markets = response.data.data || response.data || [];
            const filtered = markets.filter((m: any) => 
                m.question.toLowerCase().includes(query.toLowerCase())
            );

            return filtered.map((m: any) => this.parseMarket(m));
            
        } catch (error: any) {
            console.error(`❌ Error searching markets:`, error.message || error);
            return [];
        }
    }

    /**
     * Display market information
     */
    displayMarket(market: Market): void {
        console.log('='.repeat(60));
        console.log(`Question: ${market.question}`);
        console.log(`URL: ${market.url}`);
        console.log(`Condition ID: ${market.conditionId}`);
        console.log('-'.repeat(60));
        
        for (const token of market.tokens) {
            console.log(`${token.outcome}:`);
            console.log(`  Token ID: ${token.tokenId}`);
            if (token.price) {
                console.log(`  Price: $${token.price.toFixed(4)} (${(token.price * 100).toFixed(1)}%)`);
            }
        }
        
        console.log('='.repeat(60));
    }
}

// Example usage
if (require.main === module) {
    (async () => {
        try {
            const finder = new MarketFinder();
            
            // Find current Bitcoin market
            const market = await finder.findCurrentBitcoinMarket();
            
            if (market) {
                console.log('\n📊 Market details loaded successfully!');
            }
            
        } catch (error) {
            console.error('Error:', error);
            process.exit(1);
        }
    })();
}

