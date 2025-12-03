import { BalanceChecker } from './balance_checker';
import { Wallet } from '@ethersproject/wallet';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    console.log('💰 Polymarket Bot - Balance Checker Test\n');
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.log('❌ No PRIVATE_KEY found in .env file');
        console.log('Add your private key to test balance checking:\n');
        console.log('PRIVATE_KEY=0xYourPrivateKeyHere\n');
        return;
    }

    try {
        const wallet = new Wallet(privateKey);
        const checker = new BalanceChecker();

        console.log('Checking balances...\n');
        const balances = await checker.checkBalances(wallet);
        
        checker.displayBalances(balances);
        
        console.log('\n📊 Trading Readiness Check:');
        console.log('='.repeat(60));
        
        const tradeAmount = parseFloat(process.env.DEFAULT_TRADE_AMOUNT || '5.0');
        const check = checker.checkSufficientBalance(balances, tradeAmount, 0.05);
        
        check.warnings.forEach(w => console.log(`  ${w}`));
        
        if (!check.sufficient) {
            console.log('\n⚠️  You need more funds to start trading!');
            console.log('\nWhat to do:');
            console.log('  1. Get USDC on Polygon network (Chain ID: 137)');
            console.log('     Contract: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174');
            console.log(`  2. Send at least $${tradeAmount.toFixed(2)} USDC to: ${balances.address}`);
            console.log('  3. Get some MATIC for gas (at least 0.05 MATIC)');
            console.log('  4. Run this script again to verify\n');
        } else {
            console.log('\n✅ Ready to trade!');
            console.log(`   You can make trades of up to $${balances.usdc.toFixed(2)}`);
            console.log(`   MATIC balance will cover ~${Math.floor(balances.matic * 100)} transactions\n`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

main().catch(console.error);

