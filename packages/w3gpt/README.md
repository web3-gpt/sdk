# W3GPT

A TypeScript SDK for interacting with the W3GPT API to generate and deploy smart contracts using natural language prompts.

## Installation

```bash
npm install w3gpt
# or
pnpm add w3gpt
# or
bun add w3gpt
```

## Usage

```typescript
import { w3gpt, ChainId } from 'w3gpt';

// Initialize the client
const client = w3gpt({
  apiKey: 'w3gpt-api-key', // Get your API key at https://t.me/w3gptai
});

// Deploy a smart contract using a natural language prompt
async function deployContract() {
  try {
    const result = await client.deployContract({
      prompt: 'Create a simple ERC20 token with a fixed supply of 1000000',
      chainId: ChainId.SEPOLIA, // Optional, defaults to Sepolia (11155111)
    });

    console.log('Contract deployed:');
    console.log('IPFS URL:', result.ipfsUrl);
    console.log('Explorer URL:', result.explorerUrl);
  } catch (error) {
    console.error('Error deploying contract:', error);
  }
}

deployContract();
```

## Supported Networks

The SDK supports deploying to the following networks:

- Optimism Testnet (`ChainId.OPTIMISM_SEPOLIA = 11155420`)
- Arbitrum Testnet (`ChainId.ARBITRUM_SEPOLIA = 421614`)
- Base Testnet (`ChainId.BASE_SEPOLIA = 84532`)
- Mantle Testnet (`ChainId.MANTLE_SEPOLIA = 5003`)
- Metis Testnet (`ChainId.METIS_SEPOLIA = 59902`)
- Polygon Amoy Testnet (`ChainId.POLYGON_AMOY = 80002`)
- Ethereum Sepolia Testnet (`ChainId.SEPOLIA = 11155111`)

## API Reference

### Initialize Client

```typescript
const client = w3gpt({
  apiKey?: string; // Optional: Your W3GPT API key (will use process.env.W3GPT_API_KEY if not provided)
  baseUrl?: string; // Optional: Base URL for the W3GPT API (default: "https://w3gpt.ai/api/v1")
});
```

### Deploy Contract

```typescript
const result = await client.deployContract({
  prompt: string; // Required: Natural language prompt describing the smart contract
  chainId?: ChainId; // Optional: Target blockchain network ID (default: ChainId.SEPOLIA)
});
```

The response includes:

- `ipfsUrl`: IPFS URL where the contract code and metadata are stored
- `explorerUrl`: Block explorer URL for the deployed contract

## License

MIT 