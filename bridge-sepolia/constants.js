/**
 * Constants for LayerZero bridging between Ethereum Sepolia and Arbitrum Sepolia
 */

// Chain IDs in LayerZero format
const CHAIN_IDS = {
  ETHEREUM_SEPOLIA: 10161,
  ARBITRUM_SEPOLIA: 10231,
};

// USDC token addresses on different networks
const USDC_ADDRESSES = {
  ETHEREUM_SEPOLIA: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC address
  ARBITRUM_SEPOLIA: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // Arbitrum Sepolia USDC address
};

// LayerZero Endpoints
const LAYERZERO_ENDPOINTS = {
  ETHEREUM_SEPOLIA: '0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1', // LayerZero Endpoint on Ethereum Sepolia
  ARBITRUM_SEPOLIA: '0x6098e96a28E02f27B1e6BD381f870F1C8Bd169d3', // LayerZero Endpoint on Arbitrum Sepolia
};

// USDC OFT (Omnichain Fungible Token) Contracts - replace with actual OFT contracts when available
const USDC_OFT_ADDRESSES = {
  ETHEREUM_SEPOLIA: '0x4E55a4e6C0D98e4C1B4859AFe1545C840C2458a9', // Replace with actual OFT contract on Ethereum Sepolia
  ARBITRUM_SEPOLIA: '0xBE7C37B933018eEE1CCf28A37Dc329EdA8F2F099', // Replace with actual OFT contract on Arbitrum Sepolia
};

// Gas limits for LayerZero operations
const DEFAULT_GAS_LIMITS = {
  GAS_FOR_DESTINATION: 350000,
};

// RPC URLs for the networks
const RPC_URLS = {
  ETHEREUM_SEPOLIA: 'https://ethereum-sepolia.publicnode.com',
  ARBITRUM_SEPOLIA: 'https://sepolia-rollup.arbitrum.io/rpc',
};

module.exports = {
  CHAIN_IDS,
  USDC_ADDRESSES,
  LAYERZERO_ENDPOINTS,
  USDC_OFT_ADDRESSES,
  DEFAULT_GAS_LIMITS,
  RPC_URLS,
}; 