import {
  ShadowChatGPTAPIOptions,
  ShadowChatMessage,
  ShadowSendMessageOptions,
} from "../chat";
import { Protein, SeasonalIngredient } from "../ingredients/ingredients";
import { lambdaHandler } from "../lambdas/chat";
import { Season } from "../seasons/seasons";
import recipeSchema from "./recipe_schema.json";

type Diet =
  | "omnivore"
  | "pescatarian"
  | "preferably vegetarian"
  | "vegan"
  | "vegetarian";

type Recipe = {
  countryOfOrigin?: string;
  cuisine?: string;
  diet?: string;
  estimatedTime?: number;
  ingredients?: string;
  instructions?: string;
  season?: Season;
  servings?: number;
  systemOfMeasurement?: string;
  title?: string;
  type?: string;
};

export type RecipeProps = Pick<
  Recipe,
  | "type"
  | "servings"
  | "countryOfOrigin"
  | "estimatedTime"
  | "season"
  | "systemOfMeasurement"
> & {
  diet: Diet;
  possibleCuisines: Array<string>;
  avoidRecipes: Array<string>;
  possibleLeftoverRecipes: Array<string>;
  substituteIngredients: Array<string>;
  avoidProteins: Array<Protein>;
  avoidIngredients: Array<SeasonalIngredient>;
};

export type RecipeAndChatMessage = {
  recipe: Recipe;
  chatMessage: ShadowChatMessage;
};

export type RecipeRetrievalOptions = {
  systemMessage: string;
  recipeProps: RecipeProps;
  apiOptions: ShadowChatGPTAPIOptions;
  sendMessageOptions: ShadowSendMessageOptions;
  necessaryProps: Array<keyof Recipe>;
  attemptLimit?: number;
};

export async function attemptRecipeRetrieval(
  retrievalOptions: RecipeRetrievalOptions,
): Promise<Recipe | undefined> {
  if (!retrievalOptions.attemptLimit) {
    retrievalOptions.attemptLimit = 5;
  }

  const chatMsg = await lambdaHandler({
    prompt: await formatRecipePrompt(retrievalOptions.recipeProps),
    apiOptions: retrievalOptions.apiOptions,
    sendMessageOptions: retrievalOptions.sendMessageOptions,
  });
  for (let i = 1; i <= retrievalOptions.attemptLimit; i++) {
    console.log(
      `Retrieving recipe, attempt ${i} of ${retrievalOptions.attemptLimit}`,
    );
    try {
      const recipe = parseRecipe(chatMsg.text, retrievalOptions.necessaryProps);
      return recipe;
    } catch (e) {
      console.log("Failed parsing recipe, attempting again...");
    }
  }
  return undefined;
}

export async function parseRecipe(
  recipe: string,
  necessaryProps: Array<keyof Recipe>,
): Promise<Recipe> {
  let recipeObject: Recipe;
  try {
    recipeObject = JSON.parse(recipe);
  } catch (e) {
    console.log(e);
    throw new Error(`Error parsing recipe JSON`);
  }
  necessaryProps.map((props) => {
    if (!(props in recipeObject)) {
      throw new Error(`Recipe missing necessary item: ${props}`);
    }
  });
  return recipeObject;
}

export async function formatList(list: ReadonlyArray<string>): Promise<string> {
  return `${list.length > 0 ? "- " : "None"}${list.join("\n- ")}`;
}

export async function formatRecipePrompt(
  recipeProps: RecipeProps,
): Promise<string> {
  return `Please only a JSON object adhering to the provided JSON schema for a recipe based on the following parameters:

Type: ${recipeProps.type}

It should avoid the following ingredients:
${await formatList(recipeProps.avoidProteins)}

Most ingredients should be available during: ${recipeProps.season} in ${
    recipeProps.countryOfOrigin
  } 

Diet: ${recipeProps.diet}

System of measurement: ${recipeProps.systemOfMeasurement}

Servings: ${recipeProps.servings}

Time required: at most ${recipeProps.estimatedTime}, but can be less

Provide possible substitutes these ingredients if the recipe includes them: ${recipeProps.substituteIngredients.join(
    ", ",
  )} 

Possible cuisines include:
${await formatList(recipeProps.possibleCuisines)}

Previous recipe titles included the following list. Please avoid recipes similar to these:
${await formatList(recipeProps.avoidRecipes)}

There might be ingredients remaining from these ingredients, so prefer recipes with similar ingredients as these recipes:
${await formatList(recipeProps.possibleLeftoverRecipes)}

Please avoid these ingredients if possible:
${await formatList(recipeProps.avoidIngredients)}

JSON schema to adhere to: ${JSON.stringify(recipeSchema)}

Provide only the JSON object in your message.
`;
}
