import { Context } from "aws-lambda";
import { RecipeAndChatMessage, RecipeProps } from "../../recipes/recipes";
import { findSeason } from "../../seasons/seasons";

const systemMessage = `You are a chef living in Denmark. You provide concise advice and recipes in each response`;

export const lambdaHandler = async (
  recipes: Array<RecipeAndChatMessage>,
  context: Context,
): Promise<Array<RecipeAndChatMessage>> => {
  console.log("event: ", event);
  console.log("context: ", context);

  // TODO: retrieveHistoricRecipes()
  // Retrieve specific number of recipes
  /** for every recipe
   *     pass in historic recipes
   */

  const recipeDetails: RecipeProps = {
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

  // Call chat lambda
  // {
  //   prompt: await formatRecipePrompt(recipeDetails),
  //   apiOptions: { systemMessage, apiKey: process.env.OPENAI_API_KEY || "" },
  //   sendMessageOptions: {},
  // };

  return [];
};
