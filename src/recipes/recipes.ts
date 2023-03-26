import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import {
  ChatProps,
  MyChatGPTAPIOptions,
  ShadowChatMessage,
  ShadowSendMessageOptions,
} from "../chat";
import { Protein, SeasonalIngredient } from "../ingredients/ingredients";
import { Season } from "../seasons/seasons";
import recipeSchema from "./recipe_schema.json";

export type Diet =
  | "omnivore"
  | "pescatarian"
  | "preferably vegetarian"
  | "vegan"
  | "vegetarian";

// TODO: Add difficulty
export type Recipe = {
  countryOfOrigin?: string;
  cuisine?: string;
  diet?: string;
  estimatedTime?: number;
  ingredients?: string[];
  instructions?: string[];
  timeOfYear?: Season | string;
  servings?: number;
  systemOfMeasurement?: string;
  title?: string;
  type?: string;
  substitutes?: string[];
};

export type RecipeProps = Pick<
  Recipe,
  | "type"
  | "servings"
  | "countryOfOrigin"
  | "estimatedTime"
  | "timeOfYear"
  | "systemOfMeasurement"
> & {
  diet: Diet;
  possibleCuisines: string[];
  avoidRecipes: string[];
  possibleLeftoverRecipes: string[];
  substituteIngredients: string[];
  avoidProteins: Protein[];
  avoidIngredients: SeasonalIngredient[];
};

export type RecipeAndChatMessage = {
  recipe: Recipe;
  chatMessage: ShadowChatMessage;
};

export type RecipeRetrievalOptions = {
  systemMessage: string;
  recipeProps: RecipeProps;
  apiOptions: MyChatGPTAPIOptions;
  sendMessageOptions: ShadowSendMessageOptions;
  necessaryProps: (keyof Recipe)[];
  lambdaClient: LambdaClient;
  chatFunctionName: string;
  attemptLimit?: number;
};

export type RecipeRecord = {
  yearWeek: string;
  recipes?: RecipeAndChatMessage[];
};

export type GetRecipeRecordCommand = {
  Key: RecipeRecord;
};

export type PutRecipeRecordCommand = {
  Item: RecipeRecord;
};

export async function attemptRecipeRetrieval(
  retrievalOptions: RecipeRetrievalOptions,
): Promise<RecipeAndChatMessage | undefined> {
  if (!retrievalOptions.attemptLimit) {
    retrievalOptions.attemptLimit = 5;
  }

  const payload: ChatProps = {
    prompt: await formatRecipePrompt(retrievalOptions.recipeProps),
    apiOptions: retrievalOptions.apiOptions,
    sendMessageOptions: retrievalOptions.sendMessageOptions,
  };

  const cmd = new InvokeCommand({
    FunctionName: retrievalOptions.chatFunctionName,
    Payload: new TextEncoder().encode(JSON.stringify(payload)),
  });

  for (let i = 1; i <= retrievalOptions.attemptLimit; i++) {
    console.log(
      `Retrieving recipe, attempt ${i} of ${retrievalOptions.attemptLimit}`,
    );
    const { Payload } = await retrievalOptions.lambdaClient.send(cmd);
    if (!Payload) {
      throw new Error("No payload received from chat lambda");
    }

    let parsedRecipe: RecipeAndChatMessage;
    try {
      const result = JSON.parse(
        Buffer.from(Payload).toString(),
      ) as ShadowChatMessage;
      parsedRecipe = {
        recipe: await parseRecipe(result.text, retrievalOptions.necessaryProps),
        chatMessage: result,
      };
    } catch (err) {
      console.log(`Failed parsing recipe: ${err}; attempting again...`);
      continue;
    }
    console.log("Successfully parsed recipe");
    return parsedRecipe;
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
  necessaryProps.map((prop) => {
    if (!(prop in recipeObject)) {
      throw new Error(`Recipe missing necessary item: ${prop}`);
    }
  });

  return recipeObject;
}

export function formatList(list: string[]): string {
  return `${list.length > 0 ? "- " : "None"}${list.join("\n- ")}`;
}

export async function formatRecipePrompt(
  recipeProps: RecipeProps,
): Promise<string> {
  return `Please only a JSON object adhering to the provided JSON schema for a recipe based on the following parameters:

Type: ${recipeProps.type}

Diet: ${recipeProps.diet}

System of measurement: ${recipeProps.systemOfMeasurement}

Servings: ${recipeProps.servings}

It should be ONE of these cuisines:
${formatList(recipeProps.possibleCuisines)}

Time required: at most ${recipeProps.estimatedTime} minutes, but can be less

The majority ingredients should be available during: ${
    recipeProps.timeOfYear
  } in ${recipeProps.countryOfOrigin} 

It should avoid the following ingredients:
${formatList(recipeProps.avoidProteins)}

Provide possible substitutes for these ingredients if the recipe includes them: ${recipeProps.substituteIngredients.join(
    ", ",
  )} 

Avoid recipes similar to these:
${formatList(recipeProps.avoidRecipes)}

There might be ingredients remaining from these ingredients, so prefer recipes with similar ingredients as these recipes:
${formatList(recipeProps.possibleLeftoverRecipes)}

Avoid these ingredients, if possible:
${formatList(recipeProps.avoidIngredients)}

Your response should adhere to this JSON schema: ${JSON.stringify(recipeSchema)}

Provide only the JSON object in your message.
`;
}
