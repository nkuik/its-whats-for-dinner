export type ShadowChatMessage = {
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

export type ChatProps = {
  prompt: string;
  apiOptions: ShadowChatGPTAPIOptions;
  sendMessageOptions: ShadowSendMessageOptions;
};
