# CrossMind - Single AI agent/chatbot to simplify web3 🚀

This project is a proof-of-concept AI agent that enables users—especially blockchain newcomers—to perform complex onchain and crosschain operations simply by chatting with an AI. The agent abstracts away blockchain UX complexity, allowing users to interact with Ethereum and Rootstock(and other chains in the future), and bridge assets between them, all through natural language.

**Built by YTU Blockchain team in ETHLisbon2025.**

---

## Project Idea

- **Goal:** Make onchain and crosschain operations as easy as chatting with an AI.
- **How:** Users talk to the agent (powered by Claude, but model-agnostic), which interprets their intent and executes blockchain operations using a set of tools.
- **Demo:** For the hackathon, we implemented bridging USDC from Ethereum to Rootstock, reading balances, and other onchain actions.

## Video Demo
[Watch Demo](https://youtu.be/3Cyb6fUiJag)
---

##  Architecture Overview

The project consists of two main components:

### 1. `mcp-server` (Model Context Protocol Server)
- Originally developed by the Rootstock team.
- We extended it to support Ethereum mainnet and bridging from Ethereum to Rootstock (USDC) using Stargate/LayerZero.
- Exposes a set of blockchain tools (see below) to the agent.
- Designed to be extensible to more chains and bridges in the future.

### 2. `agent`
- The AI agent logic and API server.
- Uses Claude (Anthropic) for natural language understanding (can be swapped for other LLMs).
- Connects to the `mcp-server` via an MCP client, discovers available tools, and invokes them as needed.
- Handles conversation, tool selection, and result formatting.

---

##  Available Tools

The following tools are available via the agent (as of this hackathon demo):

- **Ethereum Mainnet:**
  - `eth_balance`: Get ETH balance of the current account.
  - `eth_erc20_balance`: Get ERC20 token balance (by contract address).

- **Rootstock:**
  - `erc20_balance`: Get ERC20 token balance.
  - `erc20_transfer`: Transfer ERC20 tokens.
  - `call_contract`: Call any contract function (with ABI).
  - `get_gas_price`: Get current gas price.
  - `get_address`: Get the current wallet address.
  - `deploy_property_nft`, `deploy_property_token`, `deploy_property_yield_vault`: Deploy demo contracts.

- **Bridging:**
  - `bridge_usdc_to_rootstock`: Bridge USDC from Ethereum mainnet to Rootstock (via Stargate, demo only).

---

## ⚡ Quickstart

### Prerequisites

- Node.js v16+
- [Anthropic API Key](https://www.anthropic.com/)
- Your own Ethereum/Rootstock wallet seed phrase (for demo, paste into `.env`)
- (Optional) USDC on Ethereum mainnet for bridging demo

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd <your-repo>
```

### 2. Install dependencies

```bash
cd mcp-server
npm install
npm run build
cd ../agent
npm install
```

### 3. Configure environment

Create a `.env` file in the `agent` directory:

```
# Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Wallet seed phrase (for demo, paste your 12-word mnemonic)
SEED_PHRASE=your_twelve_word_seed_phrase_here

# Path to built MCP server
MCP_SERVER_PATH=../mcp-server/build/index.js

# (Optional) Server port
PORT=3000
```

Create a `.env` file in the `mcp-server` directory:
```
# Wallet seed phrase (for demo, paste your 12-word mnemonic)
SEED_PHRASE=your_twelve_word_seed_phrase_here
```
### 4. Start the agent

```bash
npm start
```

This will:
- Build and start the MCP server
- Start the agent API server

### 5. Interact with the agent

- **API:** Send POST requests to `http://localhost:3000/api/agent/chat` with `{ "message": "your question" }`
- **Example:**  
  ```json
  { "message": "Bridge 1 USDC from Ethereum to Rootstock" }
  ```
- **Reset conversation:**  
  `POST /api/agent/reset`

- **Get wallet address:**  
  `GET /api/agent/get-wallet-address`

---

## Example Prompts

Here are some example prompts you can use with the agent:

- What is my address
- What is my ETH balance on Ethereum
- What is my USDC balance on Ethereum
- What is my erc20 balance on Ethereum with this contract id: 0xabc..
- What is my erc20 balance on Rootstock with this contract id: 0xabc..
- Bridge X USDC from Ethereum to Rootstock

---

##  Hackathon Notes
The ultimate goal of this AI agent is to provide users whatever they can do in web3. In the future, we plan to extend the MCP server to support all major blockchain, and set up routes between all of them. This MVP is fully working with some tools for Ethereum/Rootstock, and can be seen as how it will look like in the future.

- **Local only:** For now, everything runs locally. No hosted UI or cloud agent. 
- **Wallet management:** You must paste your seed phrase in the `.env` file. (Not production safe!)
- **Bridging:** Only USDC Ethereum → Rootstock is implemented for demo.
- **Extensibility:** The architecture supports adding more chains, tokens, and bridges.

---

##  How it Works

1. User sends a message (e.g., "What's my ETH balance?" or "Bridge 1 USDC to Rootstock").
2. The agent (Claude) interprets the intent and selects the right tool.
3. The agent calls the tool via the MCP client/server.
4. The tool executes the blockchain operation and returns the result.
5. The agent formats the response and sends it back to the user.

---

## Project Structure

```
mcp-server/   # Blockchain tool server (Rootstock + Ethereum + bridging)
agent/        # AI agent logic, API server, and Claude integration
front-end/    # Next.js front-end that communicates with the agent via REST API
```

---

## Olas Network Deployment

We have deployed our agent and custom tools to the Olas Network, making them available for public use and monetization:

### Agent Deployment
- Our CrossMind agent is now available on Olas Network: [View Agent](https://registry.olas.network/ethereum/agents/64)
- This deployment allows other users to interact with our agent and perform cross-chain operations
- The agent is monetized through Olas Network's payment system, enabling us to earn rewards as others use our agent

### Custom Tools Deployment
- We've converted and deployed our custom blockchain tools as Python components: [View Tools](https://registry.olas.network/ethereum/components/287)
- These tools are now available for other developers to use in their own agents
- The tools maintain the same functionality as our local implementation but are now accessible through Olas Network

This deployment represents a significant step in making our technology more accessible and creating a sustainable ecosystem for cross-chain AI operations.

---

##  Acknowledgements

- Rootstock team for the original MCP server and tool framework
- Anthropic for Claude API
- ETHLisbon 2025 Hackathon

---

**Enjoy cross-chain AI operations!**  
*Built with love by YTU Blockchain*