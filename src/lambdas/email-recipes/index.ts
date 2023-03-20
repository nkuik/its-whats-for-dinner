import {
  ListSubscriptionsByTopicCommand,
  PublishCommand,
  SNSClient,
  SubscribeCommand,
  Subscription,
} from "@aws-sdk/client-sns";
import { Context } from "aws-lambda";
import { Menu } from "../../menu";

export const lambdaHandler = async (
  menu: Menu,
  context: Context,
): Promise<void> => {
  console.log(`menu: ${JSON.stringify(menu)}`);
  console.log(`context: ${JSON.stringify(context)}`);

  if (!process.env.EMAIL_ADDRESSES) {
    throw new Error("Env var EMAIL_ADDRESSES not set");
  }
  if (!process.env.SNS_TOPIC_ARN) {
    throw new Error("Env var SNS_TOPIC_ARN not set");
  }

  const snsClient = new SNSClient({ region: process.env.AWS_REGION });

  try {
    const subOutput = await snsClient.send(
      new ListSubscriptionsByTopicCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
      }),
    );

    if (subOutput.NextToken) {
      throw new Error(
        "Subscriptions were over 100, and pagination not currently supported",
      );
    }
    const emails =
      subOutput.Subscriptions?.filter(
        (sub): sub is Subscription => sub.Protocol === "email",
      ).map((sub) => sub.Endpoint) || [];

    process.env.EMAIL_ADDRESSES.split(",").forEach(async (email) => {
      if (emails.includes(email)) {
        console.log("Email included, skipping");
        return;
      }
      // TODO: break out subscribe to a different lambda
      const data = await snsClient.send(
        new SubscribeCommand({
          Protocol: "email",
          TopicArn: process.env.SNS_TOPIC_ARN,
          Endpoint: email,
        }),
      );
      console.log("Success.", data);
    });

    await snsClient.send(
      new PublishCommand({
        Message: JSON.stringify(menu),
        TopicArn: process.env.SNS_TOPIC_ARN,
      }),
    );
  } catch (err) {
    console.log(`Failure sending emails: `, err);
  }
};
