import { describe, expect, test } from "bun:test";

import { PolygonChainId, w3gpt } from "./index";

const responseBody = {
  agentId: "agent_web3gpt",
  chatId: "chat_test",
  response: "Deployment started",
};

type CapturedRequest = {
  body: unknown;
  method: string | undefined;
  url: string;
};

function createFetchMock(requests: CapturedRequest[]): typeof fetch {
  return Object.assign(
    async (
      input: Parameters<typeof fetch>[0],
      init?: Parameters<typeof fetch>[1],
    ) => {
      requests.push({
        body: init?.body,
        method: init?.method,
        url: input.toString(),
      });

      return Response.json(responseBody);
    },
    { preconnect: () => undefined },
  );
}

describe("W3GPTClient", () => {
  test("starts a chat through the skill endpoint", async () => {
    const requests: CapturedRequest[] = [];
    const client = w3gpt({
      baseUrl: "https://example.com/custom/path",
      fetch: createFetchMock(requests),
    });

    await expect(client.startChat()).resolves.toEqual(responseBody);
    expect(requests).toEqual([
      {
        body: undefined,
        method: "GET",
        url: "https://example.com/api/skill",
      },
    ]);
  });

  test("targets Polygon mainnet explicitly", async () => {
    const requests: CapturedRequest[] = [];
    const client = w3gpt({ fetch: createFetchMock(requests) });

    await client.deployContract({
      chainId: PolygonChainId.Mainnet,
      prompt: "An ERC20 named GrantProof with symbol GRANT and fixed supply.",
    });

    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe("https://w3gpt.ai/api/skill");
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.body).toBe(
      JSON.stringify({
        message: [
          "Use a contract already generated in this chat when present; otherwise generate the requested smart contract.",
          "Deploy it on Polygon mainnet (chain ID 137).",
          "After deployment, return the contract address, transaction hash, and Polygonscan URL.",
          "",
          "An ERC20 named GrantProof with symbol GRANT and fixed supply.",
        ].join("\n"),
      }),
    );
  });

  test("targets Polygon Amoy and keeps the chat context", async () => {
    const requests: CapturedRequest[] = [];
    const client = w3gpt({ fetch: createFetchMock(requests) });

    await client.deployContract({
      chainId: PolygonChainId.Amoy,
      chatId: "chat_existing",
      history: true,
      prompt: "A minimal immutable message contract.",
    });

    expect(requests[0]?.url).toBe(
      "https://w3gpt.ai/api/skill?chatId=chat_existing&history=true",
    );
    expect(requests[0]?.body).toBe(
      JSON.stringify({
        chatId: "chat_existing",
        history: true,
        message: [
          "Use a contract already generated in this chat when present; otherwise generate the requested smart contract.",
          "Deploy it on Polygon Amoy testnet (chain ID 80002).",
          "After deployment, return the contract address, transaction hash, and Polygonscan URL.",
          "",
          "A minimal immutable message contract.",
        ].join("\n"),
      }),
    );
  });

  test("rejects unsupported chain IDs before making a request", async () => {
    const requests: CapturedRequest[] = [];
    const client = w3gpt({ fetch: createFetchMock(requests) });

    await expect(
      // @ts-expect-error Test runtime validation for untyped JavaScript callers.
      client.deployContract({ chainId: 1, prompt: "Do not deploy this." }),
    ).rejects.toThrow();
    expect(requests).toHaveLength(0);
  });
});
