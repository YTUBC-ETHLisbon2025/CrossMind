const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config/env');

// Don't import the MCP client directly - it will be injected by the caller
let mcpClient = null;

/**
 * ClaudeAgent - A service to interact with Claude AI
 */
class ClaudeAgent {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: config.ANTHROPIC_API_KEY,
    });
    // Use the latest Claude model without specifying a date
    this.model = 'claude-3-opus-20240229';
    this.systemPrompt = `You are an AI assistant that can interact with the Rootstock blockchain.
You have access to various blockchain tools to help users interact with Rootstock.
When a user wants to perform an operation on the blockchain, use the appropriate tool.
For contract interactions, explain clearly what you're doing.
When preparing transactions, always confirm with the user before proceeding with any operation that would modify state.`;
    this.messageHistory = [];
  }

  /**
   * Set the MCP client to use
   * @param {object} client - The MCP client
   */
  setMcpClient(client) {
    mcpClient = client;
    console.log(`MCP client set to ${client.constructor.name}`);
  }

  /**
   * Initialize the Claude Agent with the available MCP tools
   */
  async initialize() {
    try {
      console.log('Initializing Claude Agent...');
      
      // Check if API key is set
      if (!config.ANTHROPIC_API_KEY || config.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
        throw new Error('ANTHROPIC_API_KEY not set in environment variables');
      }
      
      // Check if MCP client is set
      if (!mcpClient) {
        throw new Error('MCP client not set. Call setMcpClient() before initializing.');
      }
      
      // Wait for MCP client to initialize and get available tools
      console.log('Waiting for MCP client to initialize...');
      const tools = await mcpClient.initialize();
      
      // Format tools for Claude
      console.log('Formatting tools for Claude...');
      this.tools = tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema
      }));

      console.log(`Initialized Claude Agent with ${this.tools.length} tools`);
      return true;
    } catch (error) {
      console.error('Error initializing Claude Agent:', error);
      throw error;
    }
  }

  /**
   * Send a message to Claude and get a response
   * @param {string} userMessage - The user's message
   * @returns {Promise<object>} - Claude's response
   */
  async sendMessage(userMessage) {
    try {
      console.log('Received message:', userMessage.substring(0, 100) + (userMessage.length > 100 ? '...' : ''));
      
      // Add user message to history
      this.messageHistory.push({
        role: 'user',
        content: userMessage
      });

      console.log('Sending message to Claude...');
      // Create message with Claude
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 1024,
        system: this.systemPrompt,
        messages: this.messageHistory,
        tools: this.tools
      });

      console.log('Received response from Claude');
      
      // Process tool calls if present
      if (response.content && response.content.length > 0) {
        for (const content of response.content) {
          // Handle tool calls
          if (content.type === 'tool_use') {
            const toolCall = content;
            console.log(`Claude wants to use tool: ${toolCall.name}`);
            console.log('Tool input:', JSON.stringify(toolCall.input, null, 2));
            
            try {
              // Call the tool using MCP client
              console.log(`Executing tool: ${toolCall.name}...`);
              const toolResult = await mcpClient.callTool(toolCall.name, toolCall.input);
              console.log('Tool execution result:', toolResult);
              
              // Add tool call and result to message history
              this.messageHistory.push({
                role: 'assistant',
                content: [{
                  type: 'tool_use',
                  name: toolCall.name,
                  input: toolCall.input,
                  id: toolCall.id
                }]
              });
              
              this.messageHistory.push({
                role: 'user',
                content: [{
                  type: 'tool_result',
                  tool_use_id: toolCall.id,
                  content: JSON.stringify(toolResult)
                }]
              });
              
              // Get a follow-up response from Claude with the tool result
              console.log('Getting follow-up response from Claude...');
              return this.getFollowUpResponse();
            } catch (error) {
              console.error(`Error executing tool ${toolCall.name}:`, error);
              
              // Add tool call error to message history
              this.messageHistory.push({
                role: 'assistant',
                content: [{
                  type: 'tool_use',
                  name: toolCall.name,
                  input: toolCall.input,
                  id: toolCall.id
                }]
              });
              
              this.messageHistory.push({
                role: 'user',
                content: [{
                  type: 'tool_result',
                  tool_use_id: toolCall.id,
                  content: JSON.stringify({ error: error.message })
                }]
              });
              
              // Get a follow-up response from Claude with the error
              console.log('Getting follow-up response with error...');
              return this.getFollowUpResponse();
            }
          }
        }
      }

      // If no tool calls, just add the response to history and return it
      this.messageHistory.push({
        role: 'assistant',
        content: response.content
      });

      return this.formatResponse(response);
    } catch (error) {
      console.error('Error sending message to Claude:', error);
      throw error;
    }
  }

  /**
   * Get a follow-up response after a tool call
   * @returns {Promise<object>} - Claude's follow-up response
   */
  async getFollowUpResponse() {
    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 1024,
        system: this.systemPrompt,
        messages: this.messageHistory,
        tools: this.tools
      });

      // Check if there are additional tool calls
      if (response.content && response.content.length > 0) {
        for (const content of response.content) {
          if (content.type === 'tool_use') {
            // There's another tool call, process it recursively
            console.log('Claude wants to use another tool, processing...');
            
            // Add the response to the history first
            this.messageHistory.push({
              role: 'assistant',
              content: response.content
            });
            
            // Process the new tool call
            return this.processToolCall(content);
          }
        }
      }

      // Add assistant response to history
      this.messageHistory.push({
        role: 'assistant',
        content: response.content
      });

      return this.formatResponse(response);
    } catch (error) {
      console.error('Error getting follow-up response:', error);
      throw error;
    }
  }

  /**
   * Process a tool call from Claude
   * @param {object} toolCall - The tool call to process
   * @returns {Promise<object>} - Claude's response after processing the tool call
   */
  async processToolCall(toolCall) {
    try {
      console.log(`Processing tool call: ${toolCall.name}`);
      const toolResult = await mcpClient.callTool(toolCall.name, toolCall.input);
      
      // Add tool call and result to message history
      this.messageHistory.push({
        role: 'assistant',
        content: [{
          type: 'tool_use',
          name: toolCall.name,
          input: toolCall.input,
          id: toolCall.id
        }]
      });
      
      this.messageHistory.push({
        role: 'user',
        content: [{
          type: 'tool_result',
          tool_use_id: toolCall.id,
          content: JSON.stringify(toolResult)
        }]
      });
      
      // Get a follow-up response from Claude with the tool result
      return this.getFollowUpResponse();
    } catch (error) {
      console.error(`Error processing tool call ${toolCall.name}:`, error);
      
      // Add tool call error to message history
      this.messageHistory.push({
        role: 'assistant',
        content: [{
          type: 'tool_use',
          name: toolCall.name,
          input: toolCall.input,
          id: toolCall.id
        }]
      });
      
      this.messageHistory.push({
        role: 'user',
        content: [{
          type: 'tool_result',
          tool_use_id: toolCall.id,
          content: JSON.stringify({ error: error.message })
        }]
      });
      
      // Get a follow-up response from Claude with the error
      return this.getFollowUpResponse();
    }
  }

  /**
   * Format the response from Claude for the client
   * @param {object} response - Claude's response
   * @returns {object} - Formatted response
   */
  formatResponse(response) {
    // Extract text content from the response
    const textContent = response.content
      .filter(content => content.type === 'text')
      .map(content => content.text)
      .join('\n');
    
    return {
      message: textContent,
      id: response.id
    };
  }

  /**
   * Clear the message history
   */
  clearHistory() {
    console.log('Clearing conversation history');
    this.messageHistory = [];
  }
}

// Export a singleton instance
module.exports = new ClaudeAgent(); 