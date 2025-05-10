require('dotenv').config();
const { createPublicClient, createWalletClient, http, parseUnits, formatUnits } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { sepolia, arbitrumSepolia } = require('viem/chains');
const { 
  USDC_ADDRESSES,
  USDC_OFT_ADDRESSES,
  RPC_URLS 
} = require('./constants');

// ERC20 ABI (only what we need)
const erc20Abi = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

// Set up wallet with private key
if (!process.env.PRIVATE_KEY) {
  console.error('Please set PRIVATE_KEY in .env file');
  process.exit(1);
}

// Setting up clients
const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY.replace(/^0x/, '')}`);

const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URLS.ETHEREUM_SEPOLIA),
});

const arbitrumSepoliaClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(RPC_URLS.ARBITRUM_SEPOLIA),
});

const sepoliaWallet = createWalletClient({
  account,
  chain: sepolia,
  transport: http(RPC_URLS.ETHEREUM_SEPOLIA),
});

const arbitrumSepoliaWallet = createWalletClient({
  account,
  chain: arbitrumSepolia,
  transport: http(RPC_URLS.ARBITRUM_SEPOLIA),
});

// Check current allowance
async function checkAllowance(network) {
  try {
    let client, tokenAddress, oftAddress;
    
    if (network === 'sepolia') {
      client = sepoliaClient;
      tokenAddress = USDC_ADDRESSES.ETHEREUM_SEPOLIA;
      oftAddress = USDC_OFT_ADDRESSES.ETHEREUM_SEPOLIA;
    } else if (network === 'arbitrum') {
      client = arbitrumSepoliaClient;
      tokenAddress = USDC_ADDRESSES.ARBITRUM_SEPOLIA;
      oftAddress = USDC_OFT_ADDRESSES.ARBITRUM_SEPOLIA;
    } else {
      throw new Error('Invalid network. Use "sepolia" or "arbitrum"');
    }
    
    const allowance = await client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [account.address, oftAddress],
    });
    
    console.log(`Current allowance on ${network}: ${formatUnits(allowance, 6)} USDC`);
    return allowance;
  } catch (error) {
    console.error(`Error checking allowance on ${network}:`, error);
    return BigInt(0);
  }
}

// Approve OFT contract to spend USDC
async function approveUSDC(network, amount) {
  try {
    let wallet, tokenAddress, oftAddress, networkName;
    
    if (network === 'sepolia') {
      wallet = sepoliaWallet;
      tokenAddress = USDC_ADDRESSES.ETHEREUM_SEPOLIA;
      oftAddress = USDC_OFT_ADDRESSES.ETHEREUM_SEPOLIA;
      networkName = 'Ethereum Sepolia';
    } else if (network === 'arbitrum') {
      wallet = arbitrumSepoliaWallet;
      tokenAddress = USDC_ADDRESSES.ARBITRUM_SEPOLIA;
      oftAddress = USDC_OFT_ADDRESSES.ARBITRUM_SEPOLIA;
      networkName = 'Arbitrum Sepolia';
    } else {
      throw new Error('Invalid network. Use "sepolia" or "arbitrum"');
    }
    
    const amountToApprove = amount ? BigInt(amount) : parseUnits('1000000', 6); // Default 1M USDC
    console.log(`Approving ${formatUnits(amountToApprove, 6)} USDC for OFT contract on ${networkName}...`);
    
    const txHash = await wallet.writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [oftAddress, amountToApprove],
    });
    
    console.log(`Approval transaction submitted: ${txHash}`);
    console.log(`Check on block explorer for ${networkName}`);
  } catch (error) {
    console.error(`Error approving on ${network}:`, error);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const network = args[0]?.toLowerCase();
  const amount = args[1];
  
  if (!network || (network !== 'sepolia' && network !== 'arbitrum')) {
    console.log(`
Usage:
  node approve.js sepolia [amount] - Approve USDC spending on Ethereum Sepolia
  node approve.js arbitrum [amount] - Approve USDC spending on Arbitrum Sepolia
  
If amount is not provided, it will default to 1,000,000 USDC (with 6 decimals).
    `);
    process.exit(1);
  }
  
  // Check current allowance
  await checkAllowance(network);
  
  // Ask for confirmation
  console.log('Proceeding with approval...');
  await approveUSDC(network, amount);
}

main().catch(console.error); 