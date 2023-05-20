import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { Context, EventBridgeEvent } from "aws-lambda";
import { MenuRequest } from "../../menu";
import { RecipeAndChatMessage } from "../../recipes/recipes";
import { buildYearWeek, getPreviousYearWeek } from "../../utils";

export const lambdaHandler = async (
  event: EventBridgeEvent<"Scheduled Event", unknown>,
  context: Context,
): Promise<MenuRequest> => {
  console.log(`event: ${JSON.stringify(event)}`);
  console.log(`context: ${JSON.stringify(context)}`);

  if (!process.env.DYNAMODB_TABLE_NAME) {
    throw new Error("Env var DYNAMODB_TABLE_NAME must be set");
  }

  const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
  const ddbDocClient = DynamoDBDocumentClient.from(dynamoClient);

  const menuRequest: MenuRequest = {
    servings: 2,
    numberOfMains: 4,
    numberOfSalads: 2,
    numberOfDesserts: 0,
    avoidRecipes: [],
    chefLevel: "gpt-4",
    messageToChef:
      "You are a modern-day chef. You recommend creative recipes with concise directions.",
  };

  const commandOutputs: Promise<GetCommandOutput>[] = [
    await getPreviousYearWeek(new Date()),
    await buildYearWeek(new Date()),
  ].map(async (yearWeek) => {
    return await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: {
          yearWeek: yearWeek,
        },
      }),
    );
  });

  const recipes = await Promise.all(commandOutputs).then((outputs) => {
    return outputs.flatMap((output) => (output.Item ? [output.Item] : []));
  });

  console.log("recipes: ", recipes);

  if (recipes) {
    menuRequest.avoidRecipes = recipes.flatMap((recipe) =>
      (recipe.recipes ? [recipe.recipes as RecipeAndChatMessage[]] : []).flat(),
    );
  }

  return menuRequest;
};
