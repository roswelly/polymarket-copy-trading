import { providers, Contract, BigNumber } from 'ethers';
import { formatEther, formatUnits } from '@ethersproject/units';
import { Wallet } from '@ethersproject/wallet';

const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
const POLYGON_RPC = 'https://polygon-rpc.com';

const ERC20_ABI = [
    {
        constant: true,
        inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        type: 'function'
    }
];

export interface BalanceInfo {
    usdc: number;
    matic: number;
    address: string;
}

export class BalanceChecker {
    private provider: providers.JsonRpcProvider;
    private usdcContract: Contract;

    constructor(rpcUrl: string = POLYGON_RPC) {
        this.provider = new providers.JsonRpcProvider(rpcUrl);
        this.usdcContract = new Contract(USDC_ADDRESS, ERC20_ABI, this.provider);
    }

    async checkBalances(wallet: Wallet): Promise<BalanceInfo> {
        const address = wallet.address;

        const [maticBalance, usdcBalanceRaw] = await Promise.all([
            this.provider.getBalance(address),
            this.usdcContract.balanceOf(address)
        ]);

        const matic = parseFloat(formatEther(maticBalance));
        const usdc = parseFloat(formatUnits(usdcBalanceRaw, 6));

        return {
            usdc,
            matic,
            address
        };
    }

    displayBalances(balances: BalanceInfo): void {
        console.log('='.repeat(60));
        console.log('💰 WALLET BALANCES');
        console.log('='.repeat(60));
        console.log(`Address: ${balances.address}`);
        console.log(`USDC: $${balances.usdc.toFixed(2)}`);
        console.log(`MATIC: ${balances.matic.toFixed(4)} ($${(balances.matic * 0.5).toFixed(2)} @ $0.50)`);
        console.log('='.repeat(60));
    }

    checkSufficientBalance(balances: BalanceInfo, requiredUsdc: number = 5.0, requiredMatic: number = 0.05): { 
        sufficient: boolean; 
        warnings: string[] 
    } {
        const warnings: string[] = [];
        let sufficient = true;

        if (balances.usdc < requiredUsdc) {
            warnings.push(`❌ Insufficient USDC: $${balances.usdc.toFixed(2)} (need at least $${requiredUsdc.toFixed(2)})`);
            sufficient = false;
        } else {
            warnings.push(`✅ USDC: $${balances.usdc.toFixed(2)}`);
        }

        if (balances.matic < requiredMatic) {
            warnings.push(`❌ Insufficient MATIC: ${balances.matic.toFixed(4)} (need at least ${requiredMatic.toFixed(4)} for gas)`);
            sufficient = false;
        } else {
            warnings.push(`✅ MATIC: ${balances.matic.toFixed(4)}`);
        }

        return { sufficient, warnings };
    }
}

