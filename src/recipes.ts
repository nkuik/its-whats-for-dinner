import { Protein } from "./ingredients";
import { Season } from "./seasons";

type Diet =
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "preferably vegetarian"
  | "omnivore";

type RecipeType = "main course" | "salad" | "appetizer";

export type RecipeProps = {
  maxTime: number;
  country: "Denmark";
  season: Season;
  pastRecipes: Array<string>;
  numberOfAdults: number;
  substituteCategories: Array<string>;
  measurementSystem: "imperial" | "metric";
  avoidProteins: Array<Protein>;
  diet: Diet;
  type: RecipeType;
};

type Recipe = {
  title?: string;
  cuisine?: string;
  diet?: string;
  estimatedTime?: string;
  type?: string;
};

export async function parseRecipe(recipe: string): Promise<Recipe> {
  const maybeTitle = /Title: (?<title>.+)/.exec(recipe);
  const maybeCuisine = /Cuisine: (?<cuisine>.+)/.exec(recipe);
  const maybeDiet = /Diet: (?<diet>.+)/.exec(recipe);
  const maybeType = /Type: (?<type>.+)/.exec(recipe);
  const maybeEstimatedTime = /Estimated time: (?<estimatedTime>.+)/.exec(
    recipe,
  );

  return {
    title: maybeTitle?.groups?.title,
    cuisine: maybeCuisine?.groups?.cuisine,
    diet: maybeDiet?.groups?.diet,
    estimatedTime: maybeEstimatedTime?.groups?.estimatedTime,
    type: maybeType?.groups?.type,
  };
}

export async function formatRecipePrompt(
  recipeProps: RecipeProps,
): Promise<string> {
  return `Please provide me a dinner recipe based on the following parameters:

Type: ${recipeProps.type}

It should avoid the following ingredients:
${
  recipeProps.avoidProteins.length > 0 ? "- " : ""
}${recipeProps.avoidProteins.join("\n- ")}

Most ingredients should be available during: ${recipeProps.season} in ${
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
${recipeProps.pastRecipes.length > 0 ? "- " : ""}${recipeProps.pastRecipes.join(
    "\n- ",
  )}

There might be ingredients remaining from these ingredients, so prefer recipes with similar ingredients as these recipes:
${recipeProps.pastRecipes.length > 0 ? "- " : ""}${recipeProps.pastRecipes.join(
    "\n- ",
  )}

The recipe should have the following format:

Title:

Cuisine:

Diet:

Type:

Estimated time:

Ingredients:

Instructions:
`;
}
