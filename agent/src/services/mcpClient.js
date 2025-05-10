const { spawn } = require('child_process');
const config = require('../config/env');

/**
 * MCPClient - A service to interact with the RSK MCP server 
 */
class MCPClient {
  constructor() {
    this.client = null;
    this.mcpServerProcess = null;
    this.availableTools = null;
  }

  /**
   * Initialize the MCP client and connect to the RSK MCP server
   */
  async initialize() {
    try {
      console.log('Starting RSK MCP server...');
      
      // Start the MCP server as a child process
      this.mcpServerProcess = spawn('node', [config.MCP_SERVER_PATH], {
        env: {
          ...process.env,
          SEED_PHRASE: process.env.SEED_PHRASE // Pass seed phrase to MCP server
        }
      });

      // Handle MCP server output for debugging
      this.mcpServerProcess.stderr.on('data', (data) => {
        console.log(`MCP Server: ${data.toString()}`);
      });

      this.mcpServerProcess.stdout.on('data', (data) => {
        // Only for debugging, not using this for actual communication
        console.log(`MCP Server stdout: ${data.toString().substring(0, 100)}...`);
      });

      // Add error handling for child process
      this.mcpServerProcess.on('error', (error) => {
        console.error('Failed to start MCP server:', error);
      });

      this.mcpServerProcess.on('exit', (code, signal) => {
        if (code !== null) {
          console.log(`MCP server process exited with code ${code}`);
        } else if (signal !== null) {
          console.log(`MCP server process killed with signal ${signal}`);
        }
      });
      
      // Allow some time for the server to start
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create transport for communication with the server
      console.log('Creating MCP client transport...');
      const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
      const transport = new StdioClientTransport(
        {
          command: "node",
          args: [config.MCP_SERVER_PATH]
        }
      );

      // Create MCP client
      console.log('Creating MCP client...');
      const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
      this.client = new Client({
        name: 'MCP Client',
        version: '1.0.0'
      });
      
      // Connect to the server
      console.log('Connecting to MCP server...');
      await this.client.connect(transport);

      // Fetch available tools from the MCP server
      console.log('Listing available tools...');
      const toolsResponse = await this.client.listTools();
      this.availableTools = toolsResponse.tools;

      console.log('MCP Client initialized successfully');
      console.log(`Available tools: ${this.availableTools.map(tool => tool.name).join(', ')}`);

      return this.availableTools;
    } catch (error) {
      console.error('Error initializing MCP client:', error);
      // If there's an error, clean up any resources
      if (this.mcpServerProcess) {
        this.mcpServerProcess.kill();
        this.mcpServerProcess = null;
      }
      throw error;
    }
  }

  /**
   * Call a tool on the MCP server
   * @param {string} toolName - Name of the tool to call
   * @param {object} args - Arguments for the tool
   * @returns {Promise<object>} - Tool execution result
   */
  async callTool(toolName, args) {
    if (!this.client) {
      throw new Error('MCP client not initialized');
    }

    console.log('CALLTOOLLLLL')
    try {
      console.log(`Calling tool: ${toolName} with args:`, args);
      const response = await this.client.callTool({name: toolName, arguments: args});
      
      // Extract the result from the response
      console.log('Tool response:', response);
      if (response.content && response.content[0] && response.content[0].type === 'text') {
        try {
          return JSON.parse(response.content[0].text);
        } catch (error) {
          console.error('Error parsing tool result JSON:', error);
          return { error: 'Invalid JSON response', rawResponse: response.content[0].text };
        }
      }
      
      return response;
    } catch (error) {
      console.error(`Error calling tool ${toolName}:`, error);
      throw error;
    }
  }

  /**
   * Close the MCP client and server process
   */
  close() {
    if (this.mcpServerProcess) {
      console.log('Shutting down MCP server...');
      this.mcpServerProcess.kill();
      this.mcpServerProcess = null;
    }
    this.client = null;
  }
}

// Export a singleton instance
module.exports = new MCPClient(); 