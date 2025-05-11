const express = require('express');
const path = require('path');
const fs = require('fs');
const config = require('./config/env');
const cors = require('cors');

let claudeAgent = require('./services/claudeAgent');

let mcpClient;
// Create the MCP client
try {
  // Check if the MCP server file exists
  if (config.MCP_SERVER_PATH && fs.existsSync(config.MCP_SERVER_PATH)) {
    console.log('Found MCP server at:', config.MCP_SERVER_PATH);
    mcpClient = require('./services/mcpClient');
  } else {
    console.log('MCP server not found at:', config.MCP_SERVER_PATH);   
  }
} catch (error) {
  console.error('Error initializing MCP client:', error.message);
}

// Inject the MCP client into Claude agent
claudeAgent.setMcpClient(mcpClient);
const agentRoutes = require('./routes/agentRoutes');

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [${req.method}] ${req.url}`);
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/agent', agentRoutes);

// Simple status endpoint
app.get('/status', (req, res) => {
  res.json({ 
    status: 'ok',
    agent: claudeAgent.messageHistory.length > 0 ? 'active' : 'idle',
    toolsAvailable: claudeAgent.tools ? claudeAgent.tools.length : 0,
    mcpClientType: mcpClient.constructor.name
  });
});

// Root endpoint to serve the HTML client
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Initialize the agent
async function initializeAgent() {
  try {
    console.log('Starting agent initialization...');
    
    // Check environment variables
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
      console.error('ANTHROPIC_API_KEY not set in environment variables');
      console.error('Please set your Anthropic API key in the .env file');
      process.exit(1);
    }
    
    if (!process.env.SEED_PHRASE || process.env.SEED_PHRASE === 'your_twelve_word_seed_phrase_here') {
      console.warn('Warning: SEED_PHRASE not set in environment variables');
      console.warn('Some blockchain operations may not work correctly');
    }
    
    await claudeAgent.initialize();
    console.log('Agent initialized successfully');
  } catch (error) {
    console.error('Failed to initialize agent:', error);
    // Cleanup resources
    mcpClient.close();
    process.exit(1);
  }
}

// Start the server
async function startServer() {
  try {
    // Initialize agent
    await initializeAgent();
    
    // Start Express server
    const server = app.listen(config.PORT, () => {
      console.log(`Server running on port ${config.PORT}`);
      console.log(`Open http://localhost:${config.PORT} in your browser to use the agent`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  mcpClient.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  mcpClient.close();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  mcpClient.close();
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  mcpClient.close();
  process.exit(1);
});

// Start the server
startServer(); 