import { LambdaClient } from "@aws-sdk/client-lambda";
import { Context } from "aws-lambda";
import {
  RecipeAndChatMessage,
  RecipeProps,
  RecipeRetrievalOptions,
  attemptRecipeRetrieval,
} from "../../recipes/recipes";
import { findSeason } from "../../seasons/seasons";

const systemMessage = `You are a chef living in Denmark. You provide concise advice and recipes in each response`;

export const lambdaHandler = async (
  recipes: Array<RecipeAndChatMessage>,
  context: Context,
): Promise<Array<RecipeAndChatMessage>> => {
  console.log("recipes: ", recipes);
  console.log("context: ", context);

  if (!process.env.CHAT_LAMBDA_NAME) {
    throw new Error("Env var CHAT_LAMBDA_NAME must be set!");
  }

  const recipeProps: RecipeProps = {
    estimatedTime: 45,
    countryOfOrigin: "Denmark",
    season: await findSeason(new Date()),
    avoidIngredients: [],
    avoidProteins: ["beef"],
    avoidRecipes: [],
    possibleCuisines: [],
    possibleLeftoverRecipes: [],
    servings: 2,
    substituteIngredients: ["cream"],
    systemOfMeasurement: "metric",
    diet: "preferably vegetarian",
    type: "main course",
  };

  const retrievalOptions: RecipeRetrievalOptions = {
    systemMessage,
    recipeProps,
    apiOptions: {},
    sendMessageOptions: {},
    necessaryProps: ["title", "type", "estimatedTime"],
    lambdaClient: new LambdaClient({ region: process.env.AWS_REGION }),
    chatFunctionName: process.env.CHAT_LAMBDA_NAME,
  };

  const recipe = await attemptRecipeRetrieval(retrievalOptions);

  if (!recipe) {
    throw new Error("No recipe found after making multiple attempts");
  }

  console.log(JSON.stringify(recipe));

  return [recipe];
};
