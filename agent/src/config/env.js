const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

module.exports = {
  // API Keys
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  
  // MCP Server Configuration
  MCP_SERVER_PATH: "../mcp-server/build/index.js",
  
  // Server Configuration
  PORT: process.env.PORT || 3000
}; 