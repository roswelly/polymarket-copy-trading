/**
 * Configuration management for Polymarket bot
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config();

export interface BotConfig {
    // Wallet configuration
    privateKey?: string;
    walletAddress?: string;
    
    // API configuration
    clobApiUrl: string;
    polygonChainId: number;
    polygonRpcUrl: string;
    gammaApiUrl: string;
    
    // WebSocket configuration
    softwareWsUrl: string;
    polymarketWsUrl: string;
    
    // Trading configuration
    priceDifferenceThreshold: number;
    stopLossAmount: number;
    takeProfitAmount: number;
    tradeCooldown: number;
    defaultTradeAmount: number;
    
    // Balance requirements
    minUsdcBalance: number;
    minMaticBalance: number;
    
    // Logging
    logLevel: string;
    logToFile: boolean;
    
    // WebSocket reconnection
    maxReconnectAttempts: number;
    baseReconnectDelay: number;
    maxReconnectDelay: number;
}

class ConfigManager {
    private config: BotConfig;

    constructor() {
        this.config = this.loadConfig();
    }

    private loadConfig(): BotConfig {
        // Validate required environment variables
        const privateKey = process.env.PRIVATE_KEY;
        
        return {
            // Wallet
            privateKey: privateKey && privateKey !== 'your_private_key_here' ? privateKey : undefined,
            
            // API endpoints
            clobApiUrl: process.env.CLOB_API_URL || 'https://clob.polymarket.com',
            polygonChainId: parseInt(process.env.POLYGON_CHAIN_ID || '137'),
            polygonRpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
            gammaApiUrl: process.env.GAMMA_API_URL || 'https://gamma-api.polymarket.com',
            
            // WebSocket endpoints
            softwareWsUrl: process.env.SOFTWARE_WS_URL || 'ws://45.130.166.119:5001',
            polymarketWsUrl: process.env.POLYMARKET_WS_URL || 'wss://ws-subscriptions-clob.polymarket.com/ws/market',
            
            // Trading parameters
            priceDifferenceThreshold: parseFloat(process.env.PRICE_DIFFERENCE_THRESHOLD || '0.015'),
            stopLossAmount: parseFloat(process.env.STOP_LOSS_AMOUNT || '0.005'),
            takeProfitAmount: parseFloat(process.env.TAKE_PROFIT_AMOUNT || '0.01'),
            tradeCooldown: parseInt(process.env.TRADE_COOLDOWN || '30') * 1000, // Convert to milliseconds
            defaultTradeAmount: parseFloat(process.env.DEFAULT_TRADE_AMOUNT || '5.0'),
            
            // Balance requirements
            minUsdcBalance: parseFloat(process.env.MIN_USDC_BALANCE || '5.0'),
            minMaticBalance: parseFloat(process.env.MIN_MATIC_BALANCE || '0.05'),
            
            // Logging
            logLevel: process.env.LOG_LEVEL || 'INFO',
            logToFile: process.env.LOG_TO_FILE === 'true',
            
            // WebSocket reconnection
            maxReconnectAttempts: parseInt(process.env.MAX_RECONNECT_ATTEMPTS || '10'),
            baseReconnectDelay: parseInt(process.env.BASE_RECONNECT_DELAY || '5000'),
            maxReconnectDelay: parseInt(process.env.MAX_RECONNECT_DELAY || '60000'),
        };
    }

    getConfig(): BotConfig {
        return { ...this.config };
    }

    validateConfig(): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        // Validate trading parameters
        if (this.config.priceDifferenceThreshold <= 0 || this.config.priceDifferenceThreshold > 1) {
            errors.push('PRICE_DIFFERENCE_THRESHOLD must be between 0 and 1');
        }
        
        if (this.config.stopLossAmount <= 0 || this.config.stopLossAmount > 1) {
            errors.push('STOP_LOSS_AMOUNT must be between 0 and 1');
        }
        
        if (this.config.takeProfitAmount <= 0 || this.config.takeProfitAmount > 1) {
            errors.push('TAKE_PROFIT_AMOUNT must be between 0 and 1');
        }
        
        if (this.config.defaultTradeAmount <= 0) {
            errors.push('DEFAULT_TRADE_AMOUNT must be greater than 0');
        }
        
        if (this.config.tradeCooldown < 0) {
            errors.push('TRADE_COOLDOWN must be non-negative');
        }
        
        // Validate URLs
        try {
            new URL(this.config.clobApiUrl);
        } catch {
            errors.push('CLOB_API_URL is not a valid URL');
        }
        
        try {
            new URL(this.config.polygonRpcUrl);
        } catch {
            errors.push('POLYGON_RPC_URL is not a valid URL');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    hasPrivateKey(): boolean {
        return !!this.config.privateKey;
    }

    displayConfig(): void {
        console.log('='.repeat(60));
        console.log('📋 BOT CONFIGURATION');
        console.log('='.repeat(60));
        console.log(`CLOB API URL: ${this.config.clobApiUrl}`);
        console.log(`Polygon Chain ID: ${this.config.polygonChainId}`);
        console.log(`Polygon RPC: ${this.config.polygonRpcUrl}`);
        console.log(`Gamma API: ${this.config.gammaApiUrl}`);
        console.log('-'.repeat(60));
        console.log(`Price Threshold: $${this.config.priceDifferenceThreshold.toFixed(4)}`);
        console.log(`Take Profit: $${this.config.takeProfitAmount.toFixed(4)}`);
        console.log(`Stop Loss: $${this.config.stopLossAmount.toFixed(4)}`);
        console.log(`Trade Amount: $${this.config.defaultTradeAmount.toFixed(2)}`);
        console.log(`Trade Cooldown: ${this.config.tradeCooldown / 1000}s`);
        console.log('-'.repeat(60));
        console.log(`Private Key: ${this.hasPrivateKey() ? '✅ Set' : '❌ Not set'}`);
        console.log(`Log Level: ${this.config.logLevel}`);
        console.log(`Log to File: ${this.config.logToFile ? 'Yes' : 'No'}`);
        console.log('='.repeat(60));
    }
}

// Export singleton instance
export const config = new ConfigManager();

