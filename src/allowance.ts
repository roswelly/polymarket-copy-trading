/**
 * Manage token allowances for Polymarket trading
 */

import { ClobClient } from '@polymarket/clob-client';
import { Wallet, providers, Contract, BigNumber } from '@ethersproject/wallet';
import { formatUnits, parseUnits } from '@ethersproject/units';
import * as dotenv from 'dotenv';

dotenv.config();

// USDC contract address on Polygon
const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
// Polymarket ConditionalTokens contract (spender)
const CONDITIONAL_TOKENS_ADDRESS = '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045';
const POLYGON_RPC = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';

// ERC20 ABI for allowance operations
const ERC20_ABI = [
    {
        constant: true,
        inputs: [
            { name: '_owner', type: 'address' },
            { name: '_spender', type: 'address' }
        ],
        name: 'allowance',
        outputs: [{ name: '', type: 'uint256' }],
        type: 'function'
    },
    {
        constant: false,
        inputs: [
            { name: '_spender', type: 'address' },
            { name: '_value', type: 'uint256' }
        ],
        name: 'approve',
        outputs: [{ name: '', type: 'bool' }],
        type: 'function'
    }
];

export class AllowanceManager {
    private client: ClobClient;
    private wallet: Wallet;
    private provider: providers.JsonRpcProvider;
    private usdcContract: Contract;

    constructor(privateKey?: string, host?: string, chainId?: number) {
        const key = privateKey || process.env.PRIVATE_KEY;
        const apiHost = host || process.env.CLOB_API_URL || 'https://clob.polymarket.com';
        const chain = chainId || parseInt(process.env.POLYGON_CHAIN_ID || '137');

        if (!key) {
            throw new Error('Private key not provided');
        }

        this.wallet = new Wallet(key);
        this.provider = new providers.JsonRpcProvider(POLYGON_RPC);
        this.wallet = this.wallet.connect(this.provider);
        this.usdcContract = new Contract(USDC_ADDRESS, ERC20_ABI, this.wallet);
        this.client = new ClobClient(apiHost, chain, this.wallet);
    }

    /**
     * Check current USDC allowance for Polymarket
     */
    async checkAllowance(): Promise<string> {
        try {
            console.log(`💰 Wallet Address: ${this.wallet.address}`);
            console.log(`🔍 Checking USDC allowance for Polymarket...`);
            
            const allowance: BigNumber = await this.usdcContract.allowance(
                this.wallet.address,
                CONDITIONAL_TOKENS_ADDRESS
            );
            
            // USDC has 6 decimals
            const allowanceAmount = parseFloat(formatUnits(allowance, 6));
            
            console.log('='.repeat(60));
            console.log('📊 ALLOWANCE INFORMATION');
            console.log('='.repeat(60));
            console.log(`Current Allowance: $${allowanceAmount.toFixed(2)} USDC`);
            
            if (allowanceAmount === 0) {
                console.log('⚠️  No allowance set - You need to approve USDC for trading');
            } else if (allowanceAmount < 100) {
                console.log('⚠️  Low allowance - Consider increasing for larger trades');
            } else {
                console.log('✅ Allowance is set');
            }
            console.log('='.repeat(60));
            
            return allowanceAmount.toString();
        } catch (error: any) {
            console.error('❌ Error checking allowance:', error.message || error);
            throw error;
        }
    }

    /**
     * Set token allowance for trading
     */
    async setAllowance(amount: string): Promise<any> {
        try {
            console.log(`🔄 Setting allowance to ${amount} USDC...`);
            
            let allowanceAmount: BigNumber;
            
            // Handle "max" or "unlimited" keywords
            if (amount.toLowerCase() === 'max' || amount.toLowerCase() === 'unlimited' || amount.toLowerCase() === 'infinity') {
                // Maximum uint256 value
                allowanceAmount = BigNumber.from('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
                console.log('📝 Approving maximum allowance (unlimited)...');
            } else {
                const amountNum = parseFloat(amount);
                if (isNaN(amountNum) || amountNum < 0) {
                    throw new Error('Invalid amount. Use a positive number or "max" for unlimited');
                }
                // USDC has 6 decimals
                allowanceAmount = parseUnits(amountNum.toFixed(6), 6);
                console.log(`📝 Approving $${amountNum.toFixed(2)} USDC...`);
            }
            
            console.log('⏳ Waiting for transaction confirmation...');
            
            // Check current allowance first
            const currentAllowance: BigNumber = await this.usdcContract.allowance(
                this.wallet.address,
                CONDITIONAL_TOKENS_ADDRESS
            );
            
            // Only send transaction if allowance needs to change
            if (currentAllowance.eq(allowanceAmount)) {
                console.log('✅ Allowance is already set to this amount');
                return { success: true, message: 'Allowance unchanged' };
            }
            
            // Send approval transaction
            const tx = await this.usdcContract.approve(CONDITIONAL_TOKENS_ADDRESS, allowanceAmount);
            console.log(`📤 Transaction sent: ${tx.hash}`);
            console.log('⏳ Waiting for confirmation...');
            
            const receipt = await tx.wait();
            console.log('✅ Allowance set successfully!');
            console.log(`📋 Transaction confirmed in block: ${receipt.blockNumber}`);
            console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
            
            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error: any) {
            console.error('❌ Error setting allowance:', error.message || error);
            if (error.transaction) {
                console.error(`Transaction hash: ${error.transaction.hash}`);
            }
            throw error;
        }
    }

    /**
     * Approve maximum allowance for convenience
     */
    async approveMaxAllowance(): Promise<any> {
        return await this.setAllowance('max');
    }

    /**
     * Check if allowance is sufficient for trading
     */
    async isAllowanceSufficient(requiredAmount: number): Promise<boolean> {
        try {
            const allowance = await this.checkAllowance();
            const allowanceNum = parseFloat(allowance);
            return allowanceNum >= requiredAmount;
        } catch (error) {
            return false;
        }
    }

    /**
     * Ensure sufficient allowance before trading
     */
    async ensureAllowance(minAmount: number = 1000): Promise<void> {
        const isSufficient = await this.isAllowanceSufficient(minAmount);
        
        if (!isSufficient) {
            console.log(`⚠️  Allowance insufficient. Setting to ${minAmount} USDC...`);
            await this.setAllowance(minAmount.toString());
        } else {
            console.log('✅ Allowance is sufficient');
        }
    }
}

// Example usage
if (require.main === module) {
    (async () => {
        try {
            const manager = new AllowanceManager();
            
            // Check current allowance
            await manager.checkAllowance();
            
            // Optionally set allowance (commented out for safety)
            // await manager.setAllowance('1000');
            
        } catch (error) {
            console.error('Error:', error);
            process.exit(1);
        }
    })();
}

