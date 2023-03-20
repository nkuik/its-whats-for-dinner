import { lambdaHandler } from "./index";

describe("lambdaHandler", () => {
  it("should throw an error if OpenAI secret name not set", async () => {
    delete process.env.OPENAI_SECRET_NAME;
    await expect(
      lambdaHandler({
        prompt: "prompt",
        apiOptions: {},
        sendMessageOptions: {},
      }),
    ).rejects.toThrow("OpenAI secret name not set!");
  });
});
