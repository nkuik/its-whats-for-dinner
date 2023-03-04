import { Context, EventBridgeEvent } from "aws-lambda";
import { ChatProps } from "../../chat";
import { RecipeProps, formatRecipePrompt } from "../../recipes/recipes";
import { findSeason } from "../../seasons";

const systemMessage = `You are a chef living in Denmark. You provide concise advice and recipes in each response`;

export const lambdaHandler = async (
  event: EventBridgeEvent<"Scheduled Event", any>,
  context: Context,
): Promise<ChatProps> => {
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

  return {
    prompt: await formatRecipePrompt(recipeDetails),
    apiOptions: { systemMessage, apiKey: process.env.OPENAI_API_KEY || "" },
    sendMessageOptions: {},
  };
};
