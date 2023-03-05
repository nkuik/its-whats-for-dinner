import { Context, EventBridgeEvent } from "aws-lambda";
import { ChatProps } from "../../chat";
import { RecipeProps, formatRecipePrompt } from "../../recipes";
import { findSeason } from "../../seasons";

const systemMessage = `You are a chef living in Denmark. You provide concise advice and recipes in each response`;

export const lambdaHandler = async (
  event: EventBridgeEvent<"Scheduled Event", any>,
  context: Context,
): Promise<ChatProps> => {
  console.log("event: ", event);
  console.log("context: ", context);

  // TODO: retrieveHistoricRecipes()
  // TODO: Retrieve API key from system params

  const recipeDetails: RecipeProps = {
    maxTime: 45,
    country: "Denmark",
    season: await findSeason(new Date()),
    pastRecipes: [],
    numberOfAdults: 2,
    substituteCategories: ["cream"],
    measurementSystem: "metric",
    avoidProteins: ["beef"],
    diet: "preferably vegetarian",
    type: "main course",
  };

  return {
    prompt: await formatRecipePrompt(recipeDetails),
    apiOptions: { systemMessage, apiKey: process.env.OPENAI_API_KEY || "" },
    sendMessageOptions: {},
  };
};
