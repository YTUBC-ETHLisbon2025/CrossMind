const config = require('../config/env');

/**
 * MockMCPClient - A mock service that simulates the RSK MCP server
 * This allows testing without requiring the actual MCP server
 */
class MockMCPClient {
  constructor() {
    this.availableTools = this._getAvailableTools();
    console.log('Using mock MCP client for testing purposes');
  }

  /**
   * Initialize the mock MCP client
   */
  async initialize() {
    try {
      console.log('Mock MCP Client initialized successfully');
      console.log(`Available tools: ${this.availableTools.map(tool => tool.name).join(', ')}`);
      return this.availableTools;
    } catch (error) {
      console.error('Error initializing Mock MCP client:', error);
      throw error;
    }
  }

  /**
   * Mock call to a tool
   * @param {string} toolName - Name of the tool to call
   * @param {object} args - Arguments for the tool
   * @returns {Promise<object>} - Simulated tool execution result
   */
  async callTool(toolName, args) {
    console.log(`Calling mock tool: ${toolName} with args:`, args);
    
    // Simulate a delay to make it feel like the tool is doing work
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock responses based on the tool being called
    switch (toolName) {
      case 'get_gas_price':
        return { gasPrice: '0.06 gwei' };
      
      case 'get_address':
        return { address: '0x1234567890abcdef1234567890abcdef12345678' };
      
      case 'erc20_balance':
        return { 
          balance: '1000.0', 
          symbol: 'RBTC',
          address: args.contractAddress || '0xabcdef1234567890abcdef1234567890abcdef12'
        };
      
      case 'call_contract':
        return {
          success: true,
          result: 'Contract call successful',
          returnValue: 'Mock contract result'
        };
      
      case 'erc20_transfer':
        return {
          success: true,
          txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          amount: args.amount,
          to: args.toAddress
        };

      case 'deploy_property_nft':
        return {
          success: true,
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
          txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
        };

      case 'deploy_property_token':
        return {
          success: true,
          contractAddress: '0x2345678901abcdef2345678901abcdef23456789',
          txHash: '0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678901a'
        };

      case 'deploy_property_yield_vault':
        return {
          success: true,
          contractAddress: '0x3456789012abcdef3456789012abcdef34567890',
          txHash: '0xcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678901ab'
        };
        
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  /**
   * Close the mock MCP client
   */
  close() {
    console.log('Mock MCP Client closed');
  }

  /**
   * Get the available tools
   * @returns {Array<object>} - List of available tools
   */
  _getAvailableTools() {
    return [
      {
        name: 'call_contract',
        description: 'Call a contract function on Rootstock Network',
        inputSchema: {
          type: 'object',
          properties: {
            contractAddress: {
              type: 'string',
              description: 'The address of the contract to call',
            },
            functionName: {
              type: 'string',
              description: 'The name of the function to call',
            },
            functionArgs: {
              type: 'array',
              description: 'The arguments to pass to the function',
              items: {
                type: 'string',
              },
            },
            abi: {
              type: 'string',
              description: 'The ABI of the contract',
            },
          },
          required: ['contractAddress', 'functionName', 'abi'],
        },
      },
      {
        name: 'erc20_balance',
        description: 'Get the balance of an ERC20 token on Rootstock',
        inputSchema: {
          type: 'object',
          properties: {
            contractAddress: {
              type: 'string',
              description: 'The address of the contract to get the balance of',
            },
          },
          required: ['contractAddress'],
        },
      },
      {
        name: 'erc20_transfer',
        description: 'Transfer an ERC20 token on Rootstock',
        inputSchema: {
          type: 'object',
          properties: {
            contractAddress: {
              type: 'string',
              description: 'The address of the contract to transfer the token from',
            },
            toAddress: {
              type: 'string',
              description: 'The address of the recipient',
            },
            amount: {
              type: 'string',
              description: 'The amount of tokens to transfer',
            },
          },
          required: ['contractAddress', 'toAddress', 'amount'],
        },
      },
      {
        name: 'get_gas_price',
        description: 'Get the current gas price on Rootstock Network',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_address',
        description: 'Get the address of the current account',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'deploy_property_nft',
        description: 'Deploy a PropertyNFT contract on Rootstock',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'deploy_property_token',
        description: 'Deploy a PropertyToken contract on Rootstock',
        inputSchema: {
          type: 'object',
          properties: {
            propertyNFTAddress: {
              type: 'string',
              description: 'The address of the PropertyNFT',
            },
            propertyId: {
              type: 'string',
              description: 'The ID of the property',
            },
            name: {
              type: 'string',
              description: 'The name of the property',
            },
            symbol: {
              type: 'string',
              description: 'The symbol of the property',
            },
          },
          required: ['propertyNFTAddress', 'propertyId', 'name', 'symbol'],
        },
      },
      {
        name: 'deploy_property_yield_vault',
        description: 'Deploy a PropertyYieldVault contract on Rootstock',
        inputSchema: {
          type: 'object',
          properties: {
            assetAddress: {
              type: 'string',
              description: 'The address of the underlying ERC20 PropertyToken',
            },
            name: {
              type: 'string',
              description: 'The name of the vault token',
            },
            symbol: {
              type: 'string',
              description: 'The symbol of the vault token',
            },
            propertyNFTAddress: {
              type: 'string',
              description: 'The address of the PropertyNFT',
            },
            propertyId: {
              type: 'string',
              description: 'The ID of the property',
            },
          },
          required: [
            'assetAddress',
            'name',
            'symbol',
            'propertyNFTAddress',
            'propertyId',
          ],
        },
      },
    ];
  }
}

// Export a singleton instance
module.exports = new MockMCPClient(); 