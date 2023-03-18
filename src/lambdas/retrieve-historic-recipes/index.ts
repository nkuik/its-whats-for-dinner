import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Context, EventBridgeEvent } from "aws-lambda";
import { RecipeAndChatMessage } from "../../recipes/recipes";

export const calculateWeekNumber = async (
  dateObject: Date,
): Promise<number> => {
  const startDate = new Date(dateObject.getFullYear(), 0, 1);
  const days = Math.floor(
    (dateObject.valueOf() - startDate.valueOf()) / (24 * 60 * 60 * 1000),
  );
  return Math.ceil(days / 7);
};

export const lambdaHandler = async (
  event: EventBridgeEvent<"Scheduled Event", any>,
  context: Context,
): Promise<Array<RecipeAndChatMessage>> => {
  if (!process.env.DYNAMODB_TABLE_NAME) {
    throw new Error("Env var DYNAMODB_TABLE_NAME must be set");
  }
  const today = new Date();

  const yearWeek = `${today.getFullYear()}-${await calculateWeekNumber(today)}`;

  console.log(`Searching for recipes with yearWeek: ${yearWeek}`);

  const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
  const ddbDocClient = DynamoDBDocumentClient.from(dynamoClient);

  const maybeRecipes = await ddbDocClient.send(
    new GetCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        yearWeek: yearWeek,
      },
    }),
  );

  console.log(JSON.stringify(maybeRecipes));
  if (!maybeRecipes.Item || !maybeRecipes.Item.recipes) {
    return [];
  }

  return maybeRecipes.Item.recipes as RecipeAndChatMessage[];
};
