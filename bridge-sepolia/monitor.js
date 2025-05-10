require('dotenv').config();
const { ScanClient } = require('@layerzerolabs/scan-client');
const { CHAIN_IDS } = require('./constants');

// Create a LayerZero scan client
const scanClient = new ScanClient();

// Monitor a transaction
async function monitorTransaction(txHash) {
  try {
    console.log(`Monitoring transaction ${txHash}...`);
    
    // Initialize variables
    let message = null;
    let retryCount = 0;
    const maxRetries = 20;
    const retryInterval = 5000; // 5 seconds
    
    // Keep checking until we find the message or hit max retries
    while (!message && retryCount < maxRetries) {
      try {
        // Get messages by transaction hash
        const messages = await scanClient.getMessagesBySrcTxHash(txHash);
        
        if (messages && messages.length > 0) {
          message = messages[0];
          break;
        }
      } catch (error) {
        console.log(`Attempt ${retryCount + 1}: Transaction not found yet...`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryInterval));
      retryCount++;
    }
    
    if (!message) {
      console.log(`Could not find the transaction after ${maxRetries} attempts.`);
      console.log(`You can manually check the status at https://layerzeroscan.com/tx/${txHash}`);
      return;
    }
    
    // Print message details
    console.log('\nTransaction found!');
    console.log('------------------');
    console.log(`Status: ${message.status}`);
    console.log(`Source chain: ${getChainName(message.srcChainId)}`);
    console.log(`Destination chain: ${getChainName(message.dstChainId)}`);
    console.log(`Source transaction hash: ${message.srcTxHash}`);
    
    if (message.dstTxHash) {
      console.log(`Destination transaction hash: ${message.dstTxHash}`);
    }
    
    console.log(`Created at: ${new Date(message.createdAt).toLocaleString()}`);
    
    if (message.status === 'DELIVERED') {
      console.log('\nTransaction completed successfully!');
    } else if (message.status === 'INFLIGHT') {
      console.log('\nTransaction is still being processed. Check again later.');
    } else if (message.status === 'FAILED') {
      console.log('\nTransaction failed. Please check the error details on LayerZero Scan.');
    }
    
    console.log(`\nFor more details, visit: https://layerzeroscan.com/tx/${txHash}`);
  } catch (error) {
    console.error('Error monitoring transaction:', error);
  }
}

// Helper function to get chain name from chain ID
function getChainName(chainId) {
  const chains = {
    [CHAIN_IDS.ETHEREUM_SEPOLIA]: 'Ethereum Sepolia',
    [CHAIN_IDS.ARBITRUM_SEPOLIA]: 'Arbitrum Sepolia',
  };
  
  return chains[chainId] || `Unknown Chain (${chainId})`;
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const txHash = args[0];
  
  if (!txHash) {
    console.log(`
Usage:
  node monitor.js <transaction-hash>
  
Example:
  node monitor.js 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
    `);
    process.exit(1);
  }
  
  await monitorTransaction(txHash);
}

main().catch(console.error); 