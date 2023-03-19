import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { Context } from "aws-lambda";
import { Menu } from "../../menu";
import {
  GetRecipeRecordCommand,
  PutRecipeRecordCommand,
  RecipeAndChatMessage,
} from "../../recipes/recipes";
import { buildYearWeek } from "../../utils";

export const lambdaHandler = async (
  menu: Menu,
  context: Context,
): Promise<void> => {
  console.log(`menu: ${JSON.stringify(menu)}`);
  console.log(`context: ${JSON.stringify(context)}`);

  if (!process.env.DYNAMODB_TABLE_NAME) {
    throw new Error("Env var DYNAMODB_TABLE_NAME must be set");
  }
  const yearWeek = await buildYearWeek(new Date());

  console.log(`Persisting recipes with yearWeek: ${yearWeek}`);

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

  let recipesToPersist: RecipeAndChatMessage[] = [];
  if (maybeRecipes.Item && maybeRecipes.Item.recipes) {
    recipesToPersist = recipesToPersist.concat(maybeRecipes.Item.recipes);
  }
  recipesToPersist = recipesToPersist.concat(
    [menu.desserts, menu.mains, menu.desserts].flat(),
  );
  console.log(`Recipes to persist: ${JSON.stringify(recipesToPersist)}`);

  const recipeRecord: PutRecipeRecordCommand = {
    Item: {
      yearWeek: yearWeek,
      recipes: recipesToPersist,
    },
  };

  await ddbDocClient.send(
    new PutCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      ...recipeRecord,
    }),
  );
};
