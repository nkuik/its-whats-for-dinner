import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Context, EventBridgeEvent } from "aws-lambda";
import { MenuRequest } from "../../menu";
import {
  GetRecipeRecordCommand,
  RecipeAndChatMessage,
} from "../../recipes/recipes";
import { getPreviousYearWeek } from "../../utils";

export const lambdaHandler = async (
  event: EventBridgeEvent<"Scheduled Event", unknown>,
  context: Context,
): Promise<MenuRequest> => {
  console.log(`event: ${JSON.stringify(event)}`);
  console.log(`context: ${JSON.stringify(context)}`);

  if (!process.env.DYNAMODB_TABLE_NAME) {
    throw new Error("Env var DYNAMODB_TABLE_NAME must be set");
  }
  const yearWeek = await getPreviousYearWeek(new Date());

  console.log(`Searching for recipes with yearWeek: ${yearWeek}`);

  const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
  const ddbDocClient = DynamoDBDocumentClient.from(dynamoClient);

  const getRecipeRecord: GetRecipeRecordCommand = {
    Key: {
      yearWeek: yearWeek,
    },
  };

  const maybeRecipes = await ddbDocClient.send(
    new GetCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      ...getRecipeRecord,
    }),
  );

  const menuRequest: MenuRequest = {
    servings: 2,
    numberOfMains: 6,
    numberOfSalads: 3,
    numberOfDesserts: 0,
    avoidRecipes: [],
  };

  console.log(JSON.stringify(maybeRecipes));
  if (maybeRecipes.Item && maybeRecipes.Item.recipes) {
    menuRequest.avoidRecipes = maybeRecipes.Item
      .recipes as RecipeAndChatMessage[];
  }

  return menuRequest;
};
