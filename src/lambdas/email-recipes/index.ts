import {
  ListSubscriptionsByTopicCommand,
  PublishCommand,
  SNSClient,
  SubscribeCommand,
  Subscription,
} from "@aws-sdk/client-sns";
import { Context } from "aws-lambda";
import { Menu } from "../../menu";
import { RecipeAndChatMessage, formatList } from "../../recipes/recipes";

const listRecipes = (recipes: RecipeAndChatMessage[]): string => {
  if (recipes.length === 0) {
    return "No recipes of this type were found/requested.";
  }
  return recipes
    .map((recipe, i) => {
      return `${i + 1}. ${recipe.recipe.title}

      Diet: ${recipe.recipe.diet}
      Cuisine: ${recipe.recipe.cuisine}
      Estimated time: ${recipe.recipe.estimatedTime} minutes

      Ingredients:\n${
        recipe.recipe.ingredients
          ? formatList(recipe.recipe.ingredients)
          : "None"
      }

      Instructions:\n${
        recipe.recipe.instructions
          ? formatList(recipe.recipe.instructions)
          : "None"
      }

      Substitutes:\n${
        recipe.recipe.substitutes
          ? formatList(recipe.recipe.substitutes)
          : "None"
      }
      `;
    })
    .join("\n");
};

const formatMenu = (menu: Menu): string => {
  return `
  Mains:

  ${listRecipes(menu.mains)}

  Salads:

  ${listRecipes(menu.salads)}

  Desserts:

  ${listRecipes(menu.desserts)}
  `;
};

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
        console.log("Email included, skipping subscription command");
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
        Message: formatMenu(menu),
        TopicArn: process.env.SNS_TOPIC_ARN,
      }),
    );
  } catch (err) {
    console.log(`Failure sending emails: `, err);
  }
};
