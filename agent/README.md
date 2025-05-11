# RSK AI Agent

This is an AI agent that uses Claude to interact with the Rootstock blockchain through the RSK Model Context Protocol (MCP) server.

- Chat with the AI agent about Rootstock blockchain
- Use blockchain tools through natural language
- Perform operations like:
  - Call contract functions
  - Get ERC20 token balances
  - Transfer ERC20 tokens
  - Get current gas prices
  - Deploy various contracts

## Prerequisites
- Node.js (v16+)
- Anthropic API Key (for Claude)

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   cd mcp-server
   npm install
   cd ../agent
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   # API Keys
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   SEED_PHRASE=your_twelve_word_seed_phrase_here

   # MCP Server Configuration
   MCP_SERVER_PATH=../mcp-server/build/index.js

   # Server Configuration
   PORT=3001
   ```

## Usage

### Development

```
npm run dev
```

### Production

```
npm start
```

## API Endpoints

### POST /api/agent/chat

Send a message to the AI agent.

Request body:
```json
{
  "message": "What's the current gas price on Rootstock?"
}
```

Response:
```json
{
  "message": "The current gas price on Rootstock is 0.06 gwei.",
  "id": "msg_01XYZ123"
}
```

### POST /api/agent/reset

Reset the conversation history.

Response:
```json
{
  "success": true,
  "message": "Conversation history cleared"
}
```

## Architecture

This project follows a simple architecture:

1. **Express Server**: Handles HTTP requests and responses
2. **Claude Agent**: Processes natural language using Claude AI
3. **MCP Client**: Communicates with the RSK MCP server to execute blockchain operations

The flow is:
1. User sends a message to the agent
2. Claude processes the message and identifies if blockchain tools are needed
3. If tools are needed, the agent calls the MCP server
4. The MCP server executes the operation on Rootstock
5. Results are returned to Claude for final response formulation
6. Response is sent back to the user

## License

ISC 