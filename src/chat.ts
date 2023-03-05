type ShadowChatMessage = {
  role: "user" | "assistant" | "system";
  id: string;
  parentMessageId: string;
  text: string;
  detail: {
    id: string;
    object: string;
    created: number;
  };
};

type ShadowChatGPTAPIOptions = {
  apiKey: string;
  /** @defaultValue `false` **/
  debug?: boolean;
  systemMessage?: string;
  /** @defaultValue `4096` **/
  maxModelTokens?: number;
  /** @defaultValue `1000` **/
  maxResponseTokens?: number;
  completionParams?: {
    model?: string;
    temperature?: number | null;
    top_p?: number | null;
    n?: number | null;
    max_tokens?: number;
    presence_penalty?: number | null;
    frequency_penalty?: number | null;
    logit_bias?: object | null;
    user?: string;
  };
};

type ShadowSendMessageOptions = {
  name?: string;
  parentMessageId?: string;
  messageId?: string;
  stream?: boolean;
  systemMessage?: string;
  timeoutMs?: number;
  abortSignal?: AbortSignal;
};

export async function chatWithRobot(
  prompt: string,
  apiOptions: ShadowChatGPTAPIOptions,
  sendMessageOptions: ShadowSendMessageOptions,
): Promise<ShadowChatMessage> {
  const chatgpt = await import("chatgpt");
  const api = new chatgpt.ChatGPTAPI(apiOptions);
  return (await api.sendMessage(
    prompt,
    sendMessageOptions,
  )) as ShadowChatMessage;
}
