import { z } from "zod";
/**
 * Supported chain IDs for contract deployment
 */
export enum ChainId {
  OPTIMISM_SEPOLIA = 11155420,
  ARBITRUM_SEPOLIA = 421614,
  SEPOLIA = 11155111,
  MANTLE_SEPOLIA = 5003,
  METIS_SEPOLIA = 59902,
  POLYGON_AMOY = 80002,
  BASE_SEPOLIA = 84532,
}

/**
 * Configuration options for initializing the W3GPT client
 */
export type W3GPTConfig =
  | {
      /**
       * Your W3GPT API key (optional, will use process.env.W3GPT_API_KEY if not provided)
       * @optional
       */
      apiKey?: string;

      /**
       * Base URL for the W3GPT API
       * @default "https://w3gpt.ai/api/v1"
       */
      baseUrl?: string;
    }
  | undefined;

/**
 * Request parameters for deploying a smart contract
 */
export interface ContractDeployRequest {
  /**
   * Natural language prompt describing the smart contract to generate
   * @required
   */
  prompt: string;

  /**
   * Target blockchain network ID for deployment
   * @default ChainId.SEPOLIA (11155111)
   */
  chainId?: ChainId;
}

/**
 * Response from a contract deployment request
 */
export interface ContractDeployResponse {
  /**
   * IPFS URL where the contract code and metadata are stored
   */
  ipfsUrl: string;

  /**
   * Block explorer URL for the deployed contract
   */
  explorerUrl: string;
}

/**
 * API error response
 */
interface ApiErrorResponse {
  message: string;
  status?: number;
}

/**
 * W3GPT Client for interacting with the W3GPT API
 */
export class W3GPTClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  /**
   * Creates a new W3GPT client instance
   * @param config Configuration options for the client
   */
  constructor(config: W3GPTConfig) {
    const apiKey = config?.apiKey || process.env.W3GPT_API_KEY;
    if (!apiKey) {
      throw new Error(
        "W3GPT_API_KEY key not found. Request an API key at https://t.me/w3gptai",
      );
    }

    this.apiKey = apiKey;
    this.baseUrl = config?.baseUrl || "https://w3gpt.ai/api/v1";
  }

  /**
   * Deploy a smart contract using a natural language prompt
   * @param params Contract deployment parameters
   * @returns A promise that resolves to the deployment response
   */
  async deployContract(
    params: ContractDeployRequest,
  ): Promise<ContractDeployResponse> {
    const requestSchema = z.object({
      prompt: z.string().min(1),
      chainId: z.nativeEnum(ChainId).optional().default(ChainId.SEPOLIA),
    });

    const validatedParams = requestSchema.parse(params);

    try {
      const response = await fetch(`${this.baseUrl}/contracts/deploy`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedParams),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error ${response.status}`;
        try {
          const errorData = (await response.json()) as ApiErrorResponse;
          errorMessage = errorData.message || errorMessage;
        } catch (_e) {
          // If parsing fails, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(`W3GPT API Error: ${errorMessage}`);
      }

      return (await response.json()) as ContractDeployResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`W3GPT API Error: ${String(error)}`);
    }
  }
}

/**
 * Initialize a W3GPT client
 * @param config Configuration options for the client
 * @returns A new W3GPT client instance
 * @example
 * ```typescript
 * const client = w3gpt({ apiKey: "your-api-key" });
 *
 * // Deploy a contract
 * const result = await client.deployContract({
 *   prompt: "Create a simple ERC20 token with a fixed supply of 1000000",
 *   chainId: ChainId.SEPOLIA
 * });
 * ```
 */
export function w3gpt(config?: W3GPTConfig): W3GPTClient {
  return new W3GPTClient(config);
}

// Export default for convenience
export default w3gpt;
