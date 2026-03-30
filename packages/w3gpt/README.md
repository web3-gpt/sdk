# w3gpt

TypeScript client for the Web3GPT skill endpoint.

The SDK is intentionally simple:

- call with no params to create a new chat
- keep the returned `chatId`
- pass that `chatId` on later calls to continue the same thread
- set `history=true` or `full=true` if you want the full simplified history back

## Installation

```bash
npm install w3gpt
# or
pnpm add w3gpt
# or
bun add w3gpt
```

## Usage

```ts
import { w3gpt } from "w3gpt";

const client = w3gpt();

const started = await client.startChat();
console.log(started.chatId);

const reply = await client.chat({
  chatId: started.chatId,
  message: "Deploy an ERC20 on Polygon mainnet with 1,000,000 supply",
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
const client = w3gpt({
  baseUrl?: string; // defaults to https://w3gpt.ai
  fetch?: typeof fetch; // optional custom fetch implementation
});
```

### `client.startChat(agentId?)`

Create a new chat and receive a `chatId`.

### `client.chat(params?)`

```ts
const result = await client.chat({
  agentId?: string;
  chatId?: string;
  message?: string;
  history?: boolean; // defaults to false
  full?: boolean; // alias for history=true
});
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
- Deployments happen through the agent conversation itself.
- Polygon mainnet deployment is supported through the skill endpoint.
