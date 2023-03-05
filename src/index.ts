import { chatWithRobot } from "./chat";
import { RecipeProps, formatRecipePrompt, parseRecipe } from "./recipes";
import { findSeason } from "./seasons";

const systemMessage = `You are a chef living in Denmark. You provide concise advice and recipes in each response`;

async function getRecipe(): Promise<void> {
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

  const recipePrompt = await formatRecipePrompt(recipeDetails);
  const chatMsg = await chatWithRobot(
    recipePrompt,
    { systemMessage, apiKey: process.env.OPENAI_API_KEY || "" },
    {},
  );

  console.log("first", chatMsg.text);
  const parsedRecipe = await parseRecipe(chatMsg.text);

  if (parsedRecipe.title) {
    recipeDetails.pastRecipes.push(parsedRecipe.title);
  }
  recipeDetails.type = "salad";

  const recipePrompt2 = await formatRecipePrompt(recipeDetails);
  const chatMsg2 = await chatWithRobot(
    recipePrompt2,
    { systemMessage, apiKey: process.env.OPENAI_API_KEY || "" },
    {},
  );

  console.log("second", chatMsg2.text);
}

getRecipe();

// TODO: persistRecipe()
