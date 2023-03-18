import {
  ChatProps,
  ShadowChatGPTAPIOptions,
  ShadowChatMessage,
} from "../../chat";

import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

export const lambdaHandler = async (
  chatProps: ChatProps,
): Promise<ShadowChatMessage> => {
  if (!process.env.OPENAI_SECRET_NAME) {
    throw new Error("OpenAI secret name not set!");
  }

  const smClient = new SecretsManagerClient({
    region: process.env.AWS_REGION,
  });
  const cmd = new GetSecretValueCommand({
    SecretId: process.env.OPENAI_SECRET_NAME,
  });
  const rawSecret = await smClient.send(cmd);

  if (!rawSecret.SecretString) {
    throw new Error("SecretString missing from secret");
  }

  if (!chatProps.apiOptions.apiKey) {
    chatProps.apiOptions.apiKey = JSON.parse(rawSecret.SecretString)[
      "openai_api_key"
    ];
  }

  const chatgpt = await import("chatgpt");
  const api = new chatgpt.ChatGPTAPI(
    chatProps.apiOptions as ShadowChatGPTAPIOptions,
  );

  return (await api.sendMessage(
    chatProps.prompt,
    chatProps.sendMessageOptions,
  )) as ShadowChatMessage;
};
