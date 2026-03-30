import { z } from "zod";

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

const chatResponseSchema = z.object({
  agentId: z.string(),
  chatId: z.string(),
  history: z.array(skillHistoryItemSchema).optional(),
  response: z.string().nullable(),
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
export type W3GPTHistoryItem = z.infer<typeof skillHistoryItemSchema>;

type ApiErrorResponse = {
  error?: string;
};

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
        const errorData = (await response.json()) as ApiErrorResponse;
        errorMessage = errorData.error || errorMessage;
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
}

export function w3gpt(config?: W3GPTConfig): W3GPTClient {
  return new W3GPTClient(config);
}

export default w3gpt;
