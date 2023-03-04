import { ChatGPTAPI, ChatMessage } from "chatgpt";

const systemMessage = `You are a chef living in Denmark. You provide concise advice and recipes in each response`;

const api = new ChatGPTAPI({
  systemMessage,
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function chatWithRobot(prompt: string): Promise<ChatMessage> {
  return await api.sendMessage(prompt);
}
