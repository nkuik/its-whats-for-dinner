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
  apiOptions: MyChatGPTAPIOptions;
  sendMessageOptions: ShadowSendMessageOptions;
  necessaryProps: Array<keyof Recipe>;
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

    const result = JSON.parse(
      Buffer.from(Payload).toString(),
    ) as ShadowChatMessage;

    try {
      return {
        recipe: await parseRecipe(result.text, retrievalOptions.necessaryProps),
        chatMessage: result,
      };
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

export function formatList(list: string[]): string {
  return `${list.length > 0 ? "- " : "None"}${list.join("\n- ")}`;
}

export async function formatRecipePrompt(
  recipeProps: RecipeProps,
): Promise<string> {
  return `Please only a JSON object adhering to the provided JSON schema for a recipe based on the following parameters:

Type: ${recipeProps.type}

It should avoid the following ingredients:
${formatList(recipeProps.avoidProteins)}

Most ingredients should be available during: ${recipeProps.timeOfYear} in ${
    recipeProps.countryOfOrigin
  } 

Diet: ${recipeProps.diet}

System of measurement: ${recipeProps.systemOfMeasurement}

Servings: ${recipeProps.servings}

Time required: at most ${recipeProps.estimatedTime}, but can be less

Provide possible substitutes these ingredients if the recipe includes them: ${recipeProps.substituteIngredients.join(
    ", ",
  )} 

Choose one of these cuisines:
${formatList(recipeProps.possibleCuisines)}

Previous recipe titles included the following list. Avoid recipes similar to these:
${formatList(recipeProps.avoidRecipes)}

There might be ingredients remaining from these ingredients, so prefer recipes with similar ingredients as these recipes:
${formatList(recipeProps.possibleLeftoverRecipes)}

Avoid these ingredients if possible:
${formatList(recipeProps.avoidIngredients)}

Your response should adhere to this JSON schema: ${JSON.stringify(recipeSchema)}

Provide only the JSON object in your message.
`;
}
