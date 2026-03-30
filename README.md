# W3GPT SDK Monorepo

This repository contains the Web3GPT SDK package and its documentation app.

## Packages and Apps

- `packages/w3gpt`: TypeScript SDK for the Web3GPT skill endpoint
- `apps/docs`: documentation site for the SDK
- `apps/web`: lightweight web landing app for the SDK repo

## Local Development

```bash
bun install
bun dev
```

Useful commands:

- `bun run build`
- `bun run check`
- `bun run tsc`

## SDK Model

The SDK mirrors the public Web3GPT skill flow:

1. Start a chat with no params
2. Save the returned `chatId`
3. Send follow-up messages with the same `chatId`
4. Add `history=true` or `full=true` when you want the full simplified history

The SDK no longer uses API keys or the removed `/api/v1` endpoints.

## Public Docs

- Skill guide: `https://w3gpt.ai/skill.md`
- API reference: `https://w3gpt.ai/api-docs`
