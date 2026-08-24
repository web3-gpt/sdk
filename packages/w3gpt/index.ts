import { z } from "zod";

export const PolygonChainId = Object.freeze({
  Amoy: 80002,
  Mainnet: 137,
});

const polygonChainIdSchema = z.union([
  z.literal(PolygonChainId.Mainnet),
  z.literal(PolygonChainId.Amoy),
]);

const skillHistoryItemSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  text: z.string(),
});

const chatRequestSchema = z.object({
  agentId: z.string().optional(),
  chatId: z.string().optional(),
  full: z.boolean().optional(),
  history: z.boolean().optional(),
  message: z.string().trim().min(1).optional(),
});

const deployContractRequestSchema = z.object({
  agentId: z.string().optional(),
  chainId: polygonChainIdSchema,
  chatId: z.string().optional(),
  full: z.boolean().optional(),
  history: z.boolean().optional(),
  prompt: z.string().trim().min(1),
});

const chatResponseSchema = z.object({
  agentId: z.string(),
  chatId: z.string(),
  history: z.array(skillHistoryItemSchema).optional(),
  response: z.string().nullable(),
});

const apiErrorResponseSchema = z.object({
  error: z.string().optional(),
});

export type W3GPTConfig =
  | {
      /**
       * Base URL for the Web3GPT app.
       * @default "https://w3gpt.ai"
       */
      baseUrl?: string;

      /**
       * Optional custom fetch implementation.
       */
      fetch?: typeof globalThis.fetch;
    }
  | undefined;

export type W3GPTChatRequest = z.input<typeof chatRequestSchema>;
export type W3GPTChatResponse = z.infer<typeof chatResponseSchema>;
export type W3GPTDeployContractRequest = z.input<
  typeof deployContractRequestSchema
>;
export type W3GPTHistoryItem = z.infer<typeof skillHistoryItemSchema>;

function buildDeploymentMessage(
  chainId: W3GPTDeployContractRequest["chainId"],
  prompt: string,
): string {
  const network =
    chainId === PolygonChainId.Mainnet
      ? "Polygon mainnet"
      : "Polygon Amoy testnet";

  return [
    "Use a contract already generated in this chat when present; otherwise generate the requested smart contract.",
    `Deploy it on ${network} (chain ID ${chainId}).`,
    "After deployment, return the contract address, transaction hash, and Polygonscan URL.",
    "",
    prompt,
  ].join("\n");
}

export class W3GPTClient {
  private readonly endpoint: URL;
  private readonly fetchFn: typeof globalThis.fetch;

  constructor(config?: W3GPTConfig) {
    this.endpoint = new URL(
      "/api/skill",
      config?.baseUrl || "https://w3gpt.ai",
    );

    if (config?.fetch) {
      this.fetchFn = config.fetch;
      return;
    }

    if (typeof globalThis.fetch !== "function") {
      throw new Error(
        "No fetch implementation found. Pass one in config.fetch.",
      );
    }

    this.fetchFn = globalThis.fetch.bind(globalThis);
  }

  private buildUrl(params: Omit<W3GPTChatRequest, "message">): URL {
    const url = new URL(this.endpoint);

    if (params.agentId) {
      url.searchParams.set("agentId", params.agentId);
    }

    if (params.chatId) {
      url.searchParams.set("chatId", params.chatId);
    }

    if (params.history) {
      url.searchParams.set("history", "true");
    }

    if (params.full) {
      url.searchParams.set("full", "true");
    }

    return url;
  }

  private async parseResponse(response: Response): Promise<W3GPTChatResponse> {
    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;

      try {
        const errorData = apiErrorResponseSchema.safeParse(
          await response.json(),
        );
        if (errorData.success && errorData.data.error) {
          errorMessage = errorData.data.error;
        }
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      throw new Error(`W3GPT API Error: ${errorMessage}`);
    }

    return chatResponseSchema.parse(await response.json());
  }

  /**
   * Start a new chat or continue an existing one.
   *
   * - Call with no params to create a new chat and get back a chatId
   * - Pass chatId to continue the same thread
   * - Pass history=true or full=true to include the full simplified history
   */
  async chat(params: W3GPTChatRequest = {}): Promise<W3GPTChatResponse> {
    const validatedParams = chatRequestSchema.parse(params);
    const { message, ...rest } = validatedParams;
    const url = this.buildUrl(rest);

    if (!message) {
      const response = await this.fetchFn(url, { method: "GET" });
      return this.parseResponse(response);
    }

    const response = await this.fetchFn(url, {
      body: JSON.stringify({ ...rest, message }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    return this.parseResponse(response);
  }

  /**
   * Convenience helper for creating a new chat.
   */
  async startChat(agentId?: string): Promise<W3GPTChatResponse> {
    return this.chat({ agentId });
  }

  /**
   * Start a contract generation and deployment flow through the Web3GPT agent.
   *
   * An explicit chain ID is required so callers cannot accidentally send a
   * testnet request to mainnet. Review the response, then pass the returned
   * chatId to chat() to confirm deployment or answer any clarification.
   */
  async deployContract(
    params: W3GPTDeployContractRequest,
  ): Promise<W3GPTChatResponse> {
    const validatedParams = deployContractRequestSchema.parse(params);
    const { chainId, prompt, ...chatParams } = validatedParams;

    return this.chat({
      ...chatParams,
      message: buildDeploymentMessage(chainId, prompt),
    });
  }
}

export function w3gpt(config?: W3GPTConfig): W3GPTClient {
  return new W3GPTClient(config);
}

export default w3gpt;
