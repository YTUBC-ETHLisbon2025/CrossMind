# LayerZero USDC Bridge (Sepolia <-> Arbitrum Sepolia)

This project implements a token bridge for USDC between Ethereum Sepolia and Arbitrum Sepolia testnet networks using LayerZero protocol.

## Prerequisites

- Node.js (v16 or later)
- USDC tokens on either Ethereum Sepolia or Arbitrum Sepolia
- ETH on both networks for gas fees
- A wallet with a private key

## Setup

1. Clone this repository and navigate to the project directory:

```bash
cd bridge-sepolia
```

2. Install the dependencies:

```bash
npm install
```

3. Create a `.env` file with your private key and other settings:

```
# Private key for the wallet (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Amount to bridge in wei (example: 1 USDC with 6 decimals = 1000000)
AMOUNT_TO_BRIDGE=1000000
```

## Usage

You can use either the npm scripts or direct node commands.

### Using npm scripts

Check balances:
```bash
npm run check
```

Approve USDC spending:
```bash
npm run approve:sepolia  # For Ethereum Sepolia
npm run approve:arbitrum  # For Arbitrum Sepolia
```

Bridge tokens:
```bash
npm run bridge:to-arbitrum  # From Ethereum Sepolia to Arbitrum Sepolia
npm run bridge:to-ethereum  # From Arbitrum Sepolia to Ethereum Sepolia
```

Monitor a transaction:
```bash
npm run monitor <tx-hash>
```

### Using direct commands

#### Check Balances

To check your USDC balances on both networks, run:

```bash
node bridge.js
```

#### Approve USDC Spending

Before bridging tokens, you need to approve the OFT contract to spend your USDC tokens:

On Ethereum Sepolia:
```bash
node approve.js sepolia
```

On Arbitrum Sepolia:
```bash
node approve.js arbitrum
```

You can specify an amount (in wei format):
```bash
node approve.js sepolia 10000000
```

#### Bridge Tokens

To bridge tokens from Ethereum Sepolia to Arbitrum Sepolia:

```bash
node bridge.js to-arbitrum
```

To bridge tokens from Arbitrum Sepolia to Ethereum Sepolia:

```bash
node bridge.js to-ethereum
```

You can specify a custom amount:

```bash
node bridge.js to-arbitrum 5000000  # Bridge 5 USDC
```

#### Monitor Transactions

To monitor a bridge transaction:

```bash
node monitor.js <transaction-hash>
```

## How It Works

1. The bridge uses LayerZero's OFT (Omnichain Fungible Token) contracts.
2. When bridging tokens:
   - Tokens are locked in the source chain's OFT contract
   - LayerZero sends a message to the destination chain
   - The destination chain's OFT contract mints equivalent tokens

## Important Notes

- This is for testnet usage only
- Transaction times may vary based on network conditions
- You can track cross-chain transactions on [LayerZero Scan](https://layerzeroscan.com/)
- Make sure to have enough ETH on both networks for gas fees

## Troubleshooting

- **Insufficient allowance**: Run the approval script with a higher amount
- **Transaction failures**: Check that you have enough ETH for gas and that the contracts are correctly configured
- **Network issues**: Verify that you're connected to the correct networks and that your RPC endpoints are functioning

## Constants

Important contract addresses and configuration is stored in `constants.js`. Make sure these addresses are correctly set before using the bridge. 