import { chatWithRobot } from "./chat.js";
import { formatRecipePrompt } from "./recipes.js";
import { findSeason } from "./seasons.js";

async function getRecipe(recipePrompt: string): Promise<string> {
  const chatMsg = await chatWithRobot(recipePrompt);
  return chatMsg.text;
}

const recipePrompt = await formatRecipePrompt({
  maxTime: 45,
  country: "Denmark",
  season: await findSeason(new Date()),
  avoidRecipes: [],
  numberOfAdults: 2,
  substituteCategories: [],
  measurementSystem: "metric",
  avoidProteins: ["beef"],
  diet: "preferably vegetarian",
});

console.log(recipePrompt);
console.log(await getRecipe(recipePrompt));
