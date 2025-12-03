/**
 * Generate CLOB API Credentials for Polymarket
 * 
 * This script shows you how to:
 * 1. Create a wallet from your private key
 * 2. Generate or derive API credentials
 * 3. Use those credentials for authenticated API calls
 */

import { ClobClient } from '@polymarket/clob-client';
import { Wallet } from '@ethersproject/wallet';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load .env file from project root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function generateCredentials() {
    console.log('='.repeat(70));
    console.log('🔑 Polymarket CLOB Credentials Generator');
    console.log('='.repeat(70));
    
    // Step 1: Get private key
    const privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey || privateKey === 'your_private_key_here') {
        console.log('\n❌ Error: No private key found!');
        console.log('\n📝 Please add your private key to the .env file:');
        console.log('   PRIVATE_KEY=0xYourPrivateKeyHere');
        console.log('\n💡 Where to find your private key:');
        console.log('   - MetaMask: Account Details > Export Private Key');
        console.log('   - Hardware Wallet: Cannot export (use browser connection)');
        console.log('   - Magic/Email Wallet: https://reveal.magic.link/polymarket');
        process.exit(1);
    }
    
    // Step 2: Create wallet from private key
    console.log('\n📍 Step 1: Creating Wallet...');
    const wallet = new Wallet(privateKey);
    console.log(`✅ Wallet Address: ${wallet.address}`);
    
    // Step 3: Initialize CLOB client
    console.log('\n📍 Step 2: Connecting to Polymarket CLOB...');
    const host = 'https://clob.polymarket.com';
    const chainId = 137; // Polygon mainnet
    
    const client = new ClobClient(host, chainId, wallet);
    console.log('✅ Connected to CLOB API');
    
    // Step 4: Create or derive API credentials
    console.log('\n📍 Step 3: Generating API Credentials...');
    console.log('   (This will sign a message with your wallet)');
    
    try {
        // This will either:
        // - Derive existing credentials if you've used this wallet before
        // - Create new credentials if this is a new wallet
        const creds = await client.createOrDeriveApiKey();
        
        console.log('\n✅ API Credentials Generated Successfully!');
        console.log('='.repeat(70));
        console.log('📋 Your CLOB API Credentials:');
        console.log('='.repeat(70));
        console.log(`API Key:        ${creds.key}`);
        console.log(`API Secret:     ${creds.secret}`);
        console.log(`API Passphrase: ${creds.passphrase}`);
        console.log('='.repeat(70));
        
        // Step 5: Save credentials to file
        const credsFile = path.join(__dirname, '..', '.credentials.json');
        const credsData = {
            address: wallet.address,
            apiKey: creds.key,
            secret: creds.secret,
            passphrase: creds.passphrase,
            generatedAt: new Date().toISOString()
        };
        
        fs.writeFileSync(credsFile, JSON.stringify(credsData, null, 2));
        console.log(`\n💾 Credentials saved to: .credentials.json`);
        
        // Step 6: Test the credentials by creating a new client with them
        console.log('\n📍 Step 4: Testing Credentials...');
        
        // Create a new authenticated client
        const authClient = new ClobClient(host, chainId, wallet, creds);
        
        // Try to get server time
        const serverTime = await authClient.getServerTime();
        console.log(`✅ Authentication successful! Server time: ${new Date(serverTime).toISOString()}`);
        
        // Display usage instructions
        console.log('\n' + '='.repeat(70));
        console.log('📖 How to Use These Credentials:');
        console.log('='.repeat(70));
        console.log('\n1. Using Environment Variables (Recommended):');
        console.log('   Add these to your .env file:');
        console.log(`   CLOB_API_KEY=${creds.key}`);
        console.log(`   CLOB_SECRET=${creds.secret}`);
        console.log(`   CLOB_PASS_PHRASE=${creds.passphrase}`);
        
        console.log('\n2. Using in Code:');
        console.log('   ```typescript');
        console.log('   const wallet = new Wallet(privateKey);');
        console.log('   const client = new ClobClient(host, chainId, wallet);');
        console.log('   const creds = await client.createOrDeriveApiKey();');
        console.log('   // Create authenticated client');
        console.log('   const authClient = new ClobClient(host, chainId, wallet, creds);');
        console.log('   // Now you can make authenticated requests');
        console.log('   ```');
        
        console.log('\n3. Important Notes:');
        console.log('   ⚠️  Keep these credentials SECRET - they control your wallet!');
        console.log('   ⚠️  The .credentials.json file is in .gitignore (safe)');
        console.log('   ⚠️  You can regenerate them anytime with this script');
        console.log('   ✅ These credentials are wallet-specific and deterministic');
        console.log('   ✅ Running this script again will derive the same credentials');
        
        console.log('\n' + '='.repeat(70));
        console.log('✅ All Done! Your credentials are ready to use.');
        console.log('='.repeat(70));
        
    } catch (error: any) {
        console.error('\n❌ Error generating credentials:', error.message);
        console.log('\n💡 Common issues:');
        console.log('   - Make sure your private key is correct');
        console.log('   - Check your internet connection');
        console.log('   - Ensure the wallet has been used on Polymarket before');
        process.exit(1);
    }
}

// Additional utility function to check existing credentials
async function checkExistingCredentials() {
    const credsFile = path.join(__dirname, '..', '.credentials.json');
    
    if (fs.existsSync(credsFile)) {
        console.log('\n📄 Found existing credentials file:');
        const creds = JSON.parse(fs.readFileSync(credsFile, 'utf-8'));
        console.log(`   Address: ${creds.address}`);
        console.log(`   API Key: ${creds.apiKey.substring(0, 20)}...`);
        console.log(`   Generated: ${new Date(creds.generatedAt).toLocaleString()}`);
        return true;
    }
    return false;
}

// Run the script
if (require.main === module) {
    (async () => {
        try {
            await checkExistingCredentials();
            await generateCredentials();
        } catch (error) {
            console.error('Fatal error:', error);
            process.exit(1);
        }
    })();
}

export { generateCredentials };

