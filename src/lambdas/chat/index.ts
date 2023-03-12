import { ChatProps, ShadowChatMessage } from "../../chat";

export const lambdaHandler = async (
  chatProps: ChatProps,
): Promise<ShadowChatMessage> => {
  // TODO: Retrieve API key from system params
  const chatgpt = await import("chatgpt");
  const api = new chatgpt.ChatGPTAPI(chatProps.apiOptions);
  return (await api.sendMessage(
    chatProps.prompt,
    chatProps.sendMessageOptions,
  )) as ShadowChatMessage;
};
