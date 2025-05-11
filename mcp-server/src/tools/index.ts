import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  callContractHandler,
  erc20BalanceHandler,
  erc20TransferHandler,
  getGasPriceHandler,
  getAddressHandler,
  deployPropertyNFTHandler,
  deployPropertyTokenHandler,
  deployPropertyYieldVaultHandler,
  bridgeUsdcToRootstockHandler,
  ethBalanceHandler,
  ethErc20BalanceHandler,
} from "./handlers.js";

import dotenv from 'dotenv';
dotenv.config();
//The interface for the bridge_usdc_to_rootstock tool.
const bridgeUsdcToRootstockTool: Tool = {
  name: 'bridge_usdc_to_rootstock',
  description: 'Bridge USDC from Ethereum mainnet to Rootstock network. Arguments: amount (in USDC), destination address (on Rootstock).',
  arguments: [
    {
      name: 'amount',
      type: 'string',
      description: 'Amount of USDC to bridge (as a decimal, e.g., "1.5" for 1.5 USDC).',
      required: true,
    },
    {
      name: 'destination',
      type: 'string',
      description: 'Destination Rootstock address to receive bridged USDC.',
      required: true,
    },
  ],
  inputSchema: {
    type: 'object',
    properties: {
      amount: { type: 'string', description: 'Amount of USDC to bridge (as a decimal, e.g., "1.5" for 1.5 USDC).' },
      destination: { type: 'string', description: 'Destination Rootstock address to receive bridged USDC.' },
    },
    required: ['amount', 'destination'],
  },
}

//The interface for the eth_balance tool.
const ethBalanceTool: Tool = {
  name: "eth_balance",
  description: "Get the ETH balance of the current account on Ethereum mainnet",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

//The interface for the eth_erc20_balance tool.
const ethErc20BalanceTool: Tool = {
  name: "eth_erc20_balance",
  description: "Get the ERC20 token balance of the current account on Ethereum mainnet",
  inputSchema: {
    type: "object",
    properties: {
      contractAddress: {
        type: "string",
        description: "The ERC20 contract address on Ethereum mainnet",
      },
    },
    required: ["contractAddress"],
  },
};

const callContractTool: Tool = {
  name: "call_contract",
  description: "Call a contract function on Rootstock Network",
  inputSchema: {
    type: "object",
    properties: {
      contractAddress: {
        type: "string",
        description: "The address of the contract to call",
      },
      functionName: {
        type: "string",
        description: "The name of the function to call",
      },
      functionArgs: {
        type: "array",
        description: "The arguments to pass to the function",
        items: {
          type: "string",
        },
      },
      abi: {
        type: "string",
        description: "The ABI of the contract",
      },
    },
    required: ["contractAddress", "functionName", "abi"],
  },
};

// Rest is prebuilt tools for Rootstock.

const erc20BalanceTool: Tool = {
  name: "erc20_balance",
  description: "Get the balance of an ERC20 token on Rootstock",
  inputSchema: {
    type: "object",
    properties: {
      contractAddress: {
        type: "string",
        description: "The address of the contract to get the balance of",
      },
    },
    required: ["contractAddress"],
  },
};

const erc20TransferTool: Tool = {
  name: "erc20_transfer",
  description: "Transfer an ERC20 token on Rootstock",
  inputSchema: {
    type: "object",
    properties: {
      contractAddress: {
        type: "string",
        description: "The address of the contract to transfer the token from",
      },
      toAddress: {
        type: "string",
        description: "The address of the recipient",
      },
      amount: {
        type: "string",
        description: "The amount of tokens to transfer",
      },
    },
    required: ["contractAddress", "toAddress", "amount"],
  },
};

const getGasPriceTool: Tool = {
  name: "get_gas_price",
  description: "Get the current gas price on Rootstock Network",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

const getAddressTool: Tool = {
  name: "get_address",
  description: "Get the address of the current account",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

const deployPropertyNFTTool: Tool = {
  name: "deploy_property_nft",
  description: "Deploy a PropertyNFT contract on Rootstock",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

const deployPropertyTokenTool: Tool = {
  name: "deploy_property_token",
  description: "Deploy a PropertyToken contract on Rootstock",
  inputSchema: {
    type: "object",
    properties: {
      propertyNFTAddress: {
        type: "string",
        description: "The address of the PropertyNFT",
      },
      propertyId: {
        type: "string",
        description: "The ID of the property",
      },
      name: {
        type: "string",
        description: "The name of the property",
      },
      symbol: {
        type: "string",
        description: "The symbol of the property",
      },
    },
    required: ["propertyNFTAddress", "propertyId", "name", "symbol"],
  },
};

const deployPropertyYieldVaultTool: Tool = {
  name: "deploy_property_yield_vault",
  description: "Deploy a PropertyYieldVault contract on Rootstock",
  inputSchema: {
    type: "object",
    properties: {
      assetAddress: {
        type: "string",
        description: "The address of the underlying ERC20 PropertyToken",
      },
      name: {
        type: "string",
        description: "The name of the vault token",
      },
      symbol: {
        type: "string",
        description: "The symbol of the vault token",
      },
      propertyNFTAddress: {
        type: "string",
        description: "The address of the PropertyNFT",
      },
      propertyId: {
        type: "string",
        description: "The ID of the property",
      },
    },
    required: [
      "assetAddress",
      "name",
      "symbol",
      "propertyNFTAddress",
      "propertyId",
    ],
  },
};

export const rskMcpTools: Tool[] = [
  callContractTool,
  erc20BalanceTool,
  erc20TransferTool,
  getGasPriceTool,
  getAddressTool,
  deployPropertyNFTTool,
  deployPropertyTokenTool,
  deployPropertyYieldVaultTool,
  bridgeUsdcToRootstockTool,
  ethBalanceTool,
  ethErc20BalanceTool,
];

export const toolToHandler: Record<string, Function> = {
  call_contract: callContractHandler,
  erc20_balance: erc20BalanceHandler,
  erc20_transfer: erc20TransferHandler,
  get_gas_price: getGasPriceHandler,
  get_address: getAddressHandler,
  deploy_property_nft: deployPropertyNFTHandler,
  deploy_property_token: deployPropertyTokenHandler,
  deploy_property_yield_vault: deployPropertyYieldVaultHandler,
  bridge_usdc_to_rootstock: bridgeUsdcToRootstockHandler,
  eth_balance: ethBalanceHandler,
  eth_erc20_balance: ethErc20BalanceHandler,
};
