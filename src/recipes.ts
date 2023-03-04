import { Protein } from "./ingredients.js";
import { Season } from "./seasons.js";

type RecipeProps = {
  maxTime: number;
  country: "Denmark";
  season: Season;
  avoidRecipes: Array<string>;
  numberOfAdults: number;
  substituteCategories: Array<string>;
  measurementSystem: "imperial" | "metric";
  avoidProteins: Array<Protein>;
  diet: "preferably vegetarian";
};

export async function formatRecipePrompt(
  recipeProps: RecipeProps,
): Promise<string> {
  return `Please provide me a dinner recipe based on the following parameters:

It should avoid the following ingredients:
${
  recipeProps.avoidProteins.length > 0 ? "- " : ""
}${recipeProps.avoidProteins.join("\n- ")}

Most ingredients should be available during: ${recipeProps.season.season} in ${
    recipeProps.country
  } 
Diet: ${recipeProps.diet}
It should be in this system of measurement: ${recipeProps.measurementSystem}
Number of adults: ${recipeProps.numberOfAdults}
Time required: less than ${recipeProps.maxTime + 1}
Provide possible substitutes for: ${recipeProps.substituteCategories.join(
    ", ",
  )} 

Previous recipe titles included the following list. Please avoid recipes similar to these:
${
  recipeProps.avoidRecipes.length > 0 ? "- " : ""
}${recipeProps.avoidRecipes.join("\n- ")}

The recipe should have the following format:

Title:

Cuisine:

Estimated time:

Ingredients:

Instructions:`;
}
