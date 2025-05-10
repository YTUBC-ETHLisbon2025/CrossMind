require('dotenv').config();
const { createPublicClient, createWalletClient, http, parseUnits, formatUnits } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { sepolia, arbitrumSepolia } = require('viem/chains');
const { 
  CHAIN_IDS, 
  USDC_ADDRESSES, 
  LAYERZERO_ENDPOINTS, 
  USDC_OFT_ADDRESSES,
  DEFAULT_GAS_LIMITS,
  RPC_URLS 
} = require('./constants');

// ABI for OFT (Omnichain Fungible Token) contracts
const oftAbi = [
  // ERC20 functions
  'function balanceOf(address account) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  
  // OFT specific functions
  'function send(uint16 _dstChainId, bytes calldata _toAddress, uint256 _amount, address _refundAddress, address _zroPaymentAddress, bytes calldata _adapterParams) payable',
  'function estimateSendFee(uint16 _dstChainId, bytes calldata _toAddress, uint256 _amount, bool _useZro, bytes calldata _adapterParams) view returns (uint256 nativeFee, uint256 zroFee)',
  'function sendFrom(address _from, uint16 _dstChainId, bytes calldata _toAddress, uint256 _amount, address payable _refundAddress, address _zroPaymentAddress, bytes calldata _adapterParams) payable',
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

// Helper function to get balances
async function checkBalances() {
  try {
    // Get balances on Ethereum Sepolia
    const sepoliaBalance = await sepoliaClient.readContract({
      address: USDC_ADDRESSES.ETHEREUM_SEPOLIA,
      abi: oftAbi,
      functionName: 'balanceOf',
      args: [account.address],
    });
    
    // Get balances on Arbitrum Sepolia
    const arbitrumBalance = await arbitrumSepoliaClient.readContract({
      address: USDC_ADDRESSES.ARBITRUM_SEPOLIA,
      abi: oftAbi,
      functionName: 'balanceOf',
      args: [account.address],
    });
    
    console.log(`Balances for ${account.address}:`);
    console.log(`Ethereum Sepolia USDC: ${formatUnits(sepoliaBalance, 6)}`);
    console.log(`Arbitrum Sepolia USDC: ${formatUnits(arbitrumBalance, 6)}`);
  } catch (error) {
    console.error('Error checking balances:', error);
  }
}

// Bridge USDC from Ethereum Sepolia to Arbitrum Sepolia
async function bridgeToArbitrum(amount) {
  try {
    const amountToSend = amount || process.env.AMOUNT_TO_BRIDGE || '1000000'; // Default 1 USDC (6 decimals)
    console.log(`Bridging ${formatUnits(BigInt(amountToSend), 6)} USDC to Arbitrum Sepolia...`);
    
    // Encode destination address
    const addressToBytes = `0x${account.address.slice(2).padStart(64, '0')}`;
    
    // Estimate fee
    const adapterParams = '0x'; // Default empty adapter params
    const { nativeFee } = await sepoliaClient.readContract({
      address: USDC_OFT_ADDRESSES.ETHEREUM_SEPOLIA,
      abi: oftAbi,
      functionName: 'estimateSendFee',
      args: [
        CHAIN_IDS.ARBITRUM_SEPOLIA,
        addressToBytes,
        BigInt(amountToSend),
        false, // useZro
        adapterParams,
      ],
    });
    
    console.log(`Estimated fee: ${formatUnits(nativeFee, 18)} ETH`);
    
    // Send transaction
    const txHash = await sepoliaWallet.writeContract({
      address: USDC_OFT_ADDRESSES.ETHEREUM_SEPOLIA,
      abi: oftAbi,
      functionName: 'send',
      args: [
        CHAIN_IDS.ARBITRUM_SEPOLIA,
        addressToBytes,
        BigInt(amountToSend),
        account.address, // refund address
        '0x0000000000000000000000000000000000000000', // zroPaymentAddress (0x0 for now)
        adapterParams,
      ],
      value: nativeFee, // Pay the estimated fee
    });
    
    console.log(`Transaction submitted: ${txHash}`);
    console.log(`Check status on LayerZero Scan: https://layerzeroscan.com/tx/${txHash}`);
  } catch (error) {
    console.error('Error bridging to Arbitrum:', error);
  }
}

// Bridge USDC from Arbitrum Sepolia to Ethereum Sepolia
async function bridgeToEthereum(amount) {
  try {
    const amountToSend = amount || process.env.AMOUNT_TO_BRIDGE || '1000000'; // Default 1 USDC (6 decimals)
    console.log(`Bridging ${formatUnits(BigInt(amountToSend), 6)} USDC to Ethereum Sepolia...`);
    
    // Encode destination address
    const addressToBytes = `0x${account.address.slice(2).padStart(64, '0')}`;
    
    // Estimate fee
    const adapterParams = '0x'; // Default empty adapter params
    const { nativeFee } = await arbitrumSepoliaClient.readContract({
      address: USDC_OFT_ADDRESSES.ARBITRUM_SEPOLIA,
      abi: oftAbi,
      functionName: 'estimateSendFee',
      args: [
        CHAIN_IDS.ETHEREUM_SEPOLIA,
        addressToBytes,
        BigInt(amountToSend),
        false, // useZro
        adapterParams,
      ],
    });
    
    console.log(`Estimated fee: ${formatUnits(nativeFee, 18)} ETH`);
    
    // Send transaction
    const txHash = await arbitrumSepoliaWallet.writeContract({
      address: USDC_OFT_ADDRESSES.ARBITRUM_SEPOLIA,
      abi: oftAbi,
      functionName: 'send',
      args: [
        CHAIN_IDS.ETHEREUM_SEPOLIA,
        addressToBytes,
        BigInt(amountToSend),
        account.address, // refund address
        '0x0000000000000000000000000000000000000000', // zroPaymentAddress (0x0 for now)
        adapterParams,
      ],
      value: nativeFee, // Pay the estimated fee
    });
    
    console.log(`Transaction submitted: ${txHash}`);
    console.log(`Check status on LayerZero Scan: https://layerzeroscan.com/tx/${txHash}`);
  } catch (error) {
    console.error('Error bridging to Ethereum:', error);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();
  const amount = args[1];
  
  await checkBalances();
  
  if (command === 'to-arbitrum') {
    await bridgeToArbitrum(amount);
  } else if (command === 'to-ethereum') {
    await bridgeToEthereum(amount);
  } else {
    console.log(`
Usage:
  node bridge.js to-arbitrum [amount] - Bridge USDC from Ethereum Sepolia to Arbitrum Sepolia
  node bridge.js to-ethereum [amount] - Bridge USDC from Arbitrum Sepolia to Ethereum Sepolia
  
If amount is not provided, it will use the AMOUNT_TO_BRIDGE from .env or default to 1 USDC.
    `);
  }
}

main().catch(console.error); 