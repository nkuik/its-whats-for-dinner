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
  const parsedValues =
    /Title: (?<title>.+)|Cuisine: (?<cuisine>.+)|Diet: (?<diet>.+)|Type: (?<type>.+)|Estimated time: (?<estimatedTime>.+)/.exec(
      recipe,
    );

  return {
    title: parsedValues?.groups?.title,
    cuisine: parsedValues?.groups?.cuisine,
    diet: parsedValues?.groups?.diet,
    estimatedTime: parsedValues?.groups?.estimatedTime,
    type: parsedValues?.groups?.type,
  };
}

export async function formatList(list: ReadonlyArray<string>): Promise<string> {
  return `${list.length > 0 ? "- " : ""}${list.join("\n- ")}`;
}

export async function formatRecipePrompt(
  recipeProps: RecipeProps,
): Promise<string> {
  return `Please provide me a dinner recipe based on the following parameters:

Type: ${recipeProps.type}

It should avoid the following ingredients:
${await formatList(recipeProps.avoidProteins)}

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

${await formatList(recipeProps.pastRecipes)}

There might be ingredients remaining from these ingredients, so prefer recipes with similar ingredients as these recipes:
${await formatList(recipeProps.pastRecipes)}

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
