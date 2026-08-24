# w3gpt

TypeScript client for generating and deploying smart contracts through the
Web3GPT skill endpoint. Polygon mainnet and Polygon Amoy are explicit,
type-checked deployment targets.

## Installation

```bash
bun add w3gpt
# or
npm install w3gpt
```

No API key or environment variable is required.

## Deploy on Polygon mainnet

```ts
import { PolygonChainId, w3gpt } from "w3gpt";

const client = w3gpt();

const prepared = await client.deployContract({
  chainId: PolygonChainId.Mainnet,
  prompt: "An ERC20 named GrantProof with symbol GRANT and fixed supply of 1,000,000 tokens.",
});

// Review the generated contract and requested network before confirming.
console.log(prepared.response);

const deployed = await client.chat({
  chatId: prepared.chatId,
  message: "Yes. I confirm deployment to Polygon mainnet, chain ID 137.",
});

console.log(deployed.response);
```

`deployContract` requires an explicit chain ID. It reuses a contract already
generated in the supplied chat when present; otherwise it asks the agent to
generate one. It then requests deployment plus the contract address,
transaction hash, and Polygonscan URL. The agent requires explicit confirmation
before broadcasting; keep the returned `chatId` and continue with
`client.chat()` after reviewing the contract and network.

## Test first on Polygon Amoy

```ts
const deployment = await client.deployContract({
  chainId: PolygonChainId.Amoy,
  prompt: "A minimal immutable message contract.",
});
```

| Network | SDK constant | Chain ID | Explorer |
| --- | --- | ---: | --- |
| Polygon mainnet | `PolygonChainId.Mainnet` | 137 | `https://polygonscan.com` |
| Polygon Amoy | `PolygonChainId.Amoy` | 80002 | `https://amoy.polygonscan.com` |

## Chat API

The lower-level chat API remains available for contract generation, follow-up
instructions, and other Web3GPT agents.

```ts
const started = await client.startChat();

const reply = await client.chat({
  chatId: started.chatId,
  message: "Generate an ERC721 contract for event tickets.",
});

console.log(reply.response);
```

## Read History

```ts
const result = await client.chat({
  chatId: "your-chat-id",
  history: true,
});

console.log(result.history);
```

## API

### `w3gpt(config?)`

```ts
type W3GPTConfig = {
  baseUrl?: string; // defaults to https://w3gpt.ai
  fetch?: typeof globalThis.fetch; // optional custom fetch implementation
};
```

### `client.startChat(agentId?)`

Create a new chat and receive a `chatId`.

### `client.deployContract(params)`

```ts
type W3GPTDeployContractRequest = {
  chainId: 137 | 80002;
  prompt: string;
  agentId?: string;
  chatId?: string;
  history?: boolean;
  full?: boolean;
};
```

Start a generate/review/deploy flow through the agent on an explicitly selected
Polygon network. Confirm deployment in the same chat after reviewing the
generated contract and network.

### `client.chat(params?)`

```ts
type W3GPTChatRequest = {
  agentId?: string;
  chatId?: string;
  message?: string;
  history?: boolean; // defaults to false
  full?: boolean; // alias for history=true
};
```

Response:

```ts
type W3GPTChatResponse = {
  agentId: string;
  chatId: string;
  response: string | null;
  history?: Array<{
    id: string;
    role: "user" | "assistant" | "system";
    text: string;
  }>;
};
```

## Notes

- `chatId` is the secret for continuing the thread.
- If you call `client.chat()` with no params, a new chat is created.
- A deployment may require a follow-up message depending on the prompt.
- Polygon deployments happen through the agent/skill endpoint, not a browser
  wallet connector.
