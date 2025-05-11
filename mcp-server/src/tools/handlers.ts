import {
  encodeFunctionData,
  erc20Abi,
  formatUnits,
  isAddress,
  parseUnits,
  type Abi,
  type AbiFunction,
  type Account,
  type PublicActions,
  type WalletClient,
} from "viem";
import type { z} from "zod";
import type {
  CallContractSchema,
  DeployPropertyNFTSchema,
  DeployPropertyTokenSchema,
  DeployPropertyYieldVaultSchema,
  Erc20BalanceSchema,
  Erc20TransferSchema,
  EthBalanceSchema,
} from "./schemas.js";
import { constructRskScanUrl } from "../utils/index.js";
import { rootstock } from "viem/chains";
import { PropertyNFT } from "../contracts/PropertyNFT.js";
import { PropertyToken } from "../contracts/PropertyToken.js";
import { PropertyYieldVault } from "../contracts/PropertyYieldVault.js";

import axios from 'axios';
import dotenv from 'dotenv';
import { mnemonicToAccount } from "viem/accounts";
import { createWalletClient, createPublicClient } from "viem";
import { mainnet } from "viem/chains";
import { http } from "viem";
import { ETHEREUM_RPC_URL } from "../lib/constants.js";
dotenv.config();
let account = mnemonicToAccount(process.env.SEED_PHRASE!);
const mainnetWallet = createWalletClient({
  account,
  chain: mainnet,
  transport: http(ETHEREUM_RPC_URL),
});
const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(ETHEREUM_RPC_URL),
});

// Ethereum mainnet balance handlers.
export async function ethBalanceHandler(client: any): Promise<string> {
  // Use the account.address from the top-level context
  const balance = await mainnetClient.getBalance({ address: account.address });
  return formatUnits(balance, 18); // ETH has 18 decimals
}

// Ethereum mainnet ERC20 balance handlers.
export async function ethErc20BalanceHandler(client: any, args: { contractAddress: string }): Promise<string> {
  const { contractAddress } = args;
  if (!isAddress(contractAddress, { strict: false })) {
    throw new Error(`Invalid contract address: ${contractAddress}`);
  }
  // Fetch balance
  const balance = await mainnetClient.readContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [account.address],
  });
  // Fetch decimals
  const decimals = await mainnetClient.readContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: "decimals",
  });
  return formatUnits(balance, decimals);
}

// Fetch Stargate routes for USDC transfer from Ethereum to Rootstock. 
// The bridging logic is ment to support multiple chains and tokens. But we only support Ethereum -> Rootstock USDC for now due to time constraints.
async function fetchStargateRoutes() {
  try {
    // Fetching route for USDC transfer from Ethereum to Polygon - https://docs.stargate.finance
    console.log('Fetching Stargate routes for USDC transfer from Ethereum to Rootstock');
    const response = await axios.get('https://stargate.finance/api/v1/routes', {
      params: {
        srcToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC on Ethereum
        dstToken: '0x74c9f2b00581F1B11AA7ff05aa9F608B7389De67', // USDC on rootstock
        srcAddress: account.address,
        dstAddress: account.address,
        srcChainKey: 'ethereum', // All chainKeys - https://stargate.finance/api/v1/chains
        dstChainKey: 'rootstock',
        srcAmount: '1000000', // 1 USDC (6 decimals)
        dstAmountMin: '900000' // Amount to receive deducted by Stargate fees (max 0.15%)
      }
    });
    
    console.log('Stargate routes data:', response.data);
    console.log('Stargate route:', response.data.routes[0].steps);
    console.log('Stargate route:', response.data.routes[1].steps);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}

// Execute Stargate transaction.
async function executeStargateTransaction() {
  try {
    // 1. Fetch routes data
    console.log('in top: Fetching Stargate routes for USDC transfer from Ethereum to Rootstock');
    const routesData = await fetchStargateRoutes();
    
    // 2. Get the first route (or implement your own selection logic)
    // Here you can select from all the supported routes including StargateV2:Taxi, StargateBus or CCTP
    // Supported routes are different for each token
    // Each route contains all transactions required to execute the transfer given in executable order
    const selectedRoute = routesData.routes[0];
    if (!selectedRoute) {
      throw new Error('No routes available');
    }
    
    console.log('Selected route:', selectedRoute);  

    const txs = [];
    // Execute all transactions in the route steps
    for (let i = 0; i < selectedRoute.steps.length; i++) {
      const executableTransaction = selectedRoute.steps[i].transaction;
      console.log(`Executing step ${i + 1}/${selectedRoute.steps.length}:`, executableTransaction);
      
      // Create transaction object, only include value if it exists and is not empty
      const txParams = {
        account,
        to: executableTransaction.to,
        data: executableTransaction.data,
      };
      
      // Only add value if it exists and is not empty
      if (executableTransaction.value && executableTransaction.value !== '0') {
        (txParams as any).value = BigInt(executableTransaction.value);
      }
      
      // Execute the transaction
      const txHash = await mainnetWallet.sendTransaction(txParams);
      console.log(`Step ${i + 1} transaction hash: ${txHash}`);
      txs.push(txHash);

      // Wait for transaction to be mined
      const receipt = await mainnetClient.waitForTransactionReceipt({ hash: txHash });
      console.log(`Step ${i + 1} transaction confirmed:`, receipt);
    }
    
    console.log('All steps executed successfully');
    return txs;
  } catch (error) {
    console.error('Error executing Stargate transaction:', error);
    throw error;
  }
}

// The handler function for the bridge_usdc_to_rootstock tool. 
export async function bridgeUsdcToRootstockHandler(client: any, args: any) {
  const txs = await executeStargateTransaction();
  return JSON.stringify({
    status: 'success',
    message: 'Bridge USDC to Rootstock successful',
    txs,
  });
}

//Rest is prebuilt handlers for Rootstock.

export async function deployPropertyNFTHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof DeployPropertyNFTSchema>
): Promise<string> {
  if (!wallet.account?.address) {
    throw new Error("No account address available");
  }
  const hash = await wallet.deployContract({
    abi: PropertyNFT.abi,
    account: wallet.account,
    chain: wallet.chain,
    bytecode: PropertyNFT.bytecode as `0x${string}`,
  });

  // Return transaction hash and RootstockScan URL
  return JSON.stringify({
    hash,
    url: constructRskScanUrl(wallet.chain ?? rootstock, hash),
  });
}

export async function deployPropertyTokenHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof DeployPropertyTokenSchema>
): Promise<string> {
  if (!wallet.account?.address) {
    throw new Error("No account address available");
  }

  // Validate addresses
  if (!isAddress(args.propertyNFTAddress)) {
    throw new Error(`Invalid PropertyNFT address: ${args.propertyNFTAddress}`);
  }

  const hash = await wallet.deployContract({
    abi: PropertyToken.abi,
    account: wallet.account,
    chain: wallet.chain,
    bytecode: PropertyToken.bytecode as `0x${string}`,
    args: [
      args.propertyNFTAddress,
      BigInt(args.propertyId),
      args.name,
      args.symbol,
    ],
  });

  // Return transaction hash and RootstockScan URL
  return JSON.stringify({
    hash,
    url: constructRskScanUrl(wallet.chain ?? rootstock, hash),
  });
}

export async function deployPropertyYieldVaultHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof DeployPropertyYieldVaultSchema>
): Promise<string> {
  if (!wallet.account?.address) {
    throw new Error("No account address available");
  }

  // Validate addresses
  if (!isAddress(args.assetAddress)) {
    throw new Error(`Invalid asset address: ${args.assetAddress}`);
  }
  if (!isAddress(args.propertyNFTAddress)) {
    throw new Error(`Invalid PropertyNFT address: ${args.propertyNFTAddress}`);
  }

  const hash = await wallet.deployContract({
    abi: PropertyYieldVault.abi,
    account: wallet.account,
    chain: wallet.chain,
    bytecode: PropertyYieldVault.bytecode as `0x${string}`,
    args: [
      args.assetAddress,
      args.name,
      args.symbol,
      args.propertyNFTAddress,
      BigInt(args.propertyId),
    ],
  });

  // Return transaction hash and RootstockScan URL
  return JSON.stringify({
    hash,
    url: constructRskScanUrl(wallet.chain ?? rootstock, hash),
  });
}

export async function getAddressHandler(
  wallet: WalletClient & PublicActions
): Promise<string> {
  console.error('IN MCP: getAddressHandler');
  if (!wallet.account?.address) {
    throw new Error("No account address available");
  }
  return wallet.account.address;
}

export async function callContractHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof CallContractSchema>
): Promise<string> {
  let abi: string | Abi = args.abi;
  try {
    abi = JSON.parse(abi) as Abi;
  } catch (error) {
    throw new Error(`Invalid ABI: ${error}`);
  }

  if (!isAddress(args.contractAddress, { strict: false })) {
    throw new Error(`Invalid contract address: ${args.contractAddress}`);
  }
  let functionAbi: AbiFunction | undefined;

  try {
    functionAbi = abi.find(
      (item) => "name" in item && item.name === args.functionName
    ) as AbiFunction;
  } catch (error) {
    throw new Error(`Invalid function name: ${args.functionName}`);
  }

  if (
    functionAbi.stateMutability === "view" ||
    functionAbi.stateMutability === "pure"
  ) {
    const tx = await wallet.readContract({
      address: args.contractAddress,
      abi,
      functionName: args.functionName,
      args: args.functionArgs,
    });

    return String(tx);
  }

  const tx = await wallet.simulateContract({
    account: wallet.account,
    abi,
    address: args.contractAddress,
    functionName: args.functionName,
    value: BigInt(args.value ?? 0),
    args: args.functionArgs,
  });

  const txHash = await wallet.writeContract(tx.request);

  return JSON.stringify({
    hash: txHash,
    url: constructRskScanUrl(wallet.chain ?? rootstock, txHash),
  });
}

export async function erc20BalanceHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof Erc20BalanceSchema>
): Promise<string> {
  const { contractAddress } = args;

  if (!isAddress(contractAddress, { strict: false })) {
    throw new Error(`Invalid contract address: ${contractAddress}`);
  }

  const balance = await wallet.readContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [wallet.account?.address ?? "0x"],
  });

  const decimals = await wallet.readContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: "decimals",
  });

  return formatUnits(balance, decimals);
}

export async function erc20TransferHandler(
  wallet: WalletClient & PublicActions,
  args: z.infer<typeof Erc20TransferSchema>
): Promise<string> {
  const { contractAddress, toAddress, amount } = args;

  if (!isAddress(contractAddress, { strict: false })) {
    throw new Error(`Invalid contract address: ${contractAddress}`);
  }

  if (!isAddress(toAddress, { strict: false })) {
    throw new Error(`Invalid to address: ${toAddress}`);
  }

  // Get decimals for token
  const decimals = await wallet.readContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: "decimals",
  });

  // Format units
  const atomicUnits = parseUnits(amount, decimals);

  const tx = await wallet.simulateContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: "transfer",
    args: [toAddress, atomicUnits],
    account: wallet.account,
    chain: wallet.chain,
  });

  const txHash = await wallet.writeContract(tx.request);

  return JSON.stringify({
    hash: txHash,
    url: constructRskScanUrl(wallet.chain ?? rootstock, txHash),
  });
}

export async function getGasPriceHandler(
  wallet: WalletClient & PublicActions
): Promise<string> {
  const gasPrice = await wallet.getGasPrice();
  return formatUnits(gasPrice, 9) + " Gwei";
}

