import { LambdaClient } from "@aws-sdk/client-lambda";
import { Context } from "aws-lambda";
import { MyChatGPTAPIOptions } from "../../chat";
import { Menu, MenuRequest } from "../../menu";
import {
  Diet,
  Recipe,
  RecipeAndChatMessage,
  RecipeProps,
  RecipeRetrievalOptions,
  attemptRecipeRetrieval,
} from "../../recipes/recipes";

const returnRecipeTitle = (recipe: RecipeAndChatMessage): string => {
  if (!recipe.recipe.title) {
    throw new Error("Recipe was missing a title");
  }
  return recipe.recipe.title;
};

export const buildRandomCuisines = async (
  possibleCuisines: string[],
  numberToFind: number,
): Promise<string[]> => {
  if (numberToFind >= possibleCuisines.length) {
    return possibleCuisines;
  }

  let cuisines: string[] = [];
  while (cuisines.length < numberToFind) {
    cuisines.push(
      possibleCuisines[Math.floor(Math.random() * possibleCuisines.length)],
    );
    cuisines = [...new Set(cuisines)];
  }

  return cuisines;
};

export const lambdaHandler = async (
  menuRequest: MenuRequest,
  context: Context,
): Promise<Menu> => {
  console.log("recipes:", menuRequest);
  console.log("context:", context);
  console.log("systemMessage:", menuRequest.messageToChef);
  console.log("ChatGPT model:", menuRequest.chefLevel);

  if (!process.env.CHAT_LAMBDA_NAME) {
    throw new Error("Env var CHAT_LAMBDA_NAME must be set!");
  }

  const cuisines = [
    "Asian",
    "Italian",
    "Japanese",
    "Mediterranean",
    "Mexican",
    "Middle Eastern",
    "New Nordic",
    "Korean",
    "Fusion",
  ];
  const diets: Diet[] = [
    "omnivore",
    "pescatarian",
    "vegetarian",
    "vegan",
    "preferably vegetarian",
  ];
  const requiredRecipeProps: (keyof Recipe)[] = [
    "title",
    "type",
    "estimatedTime",
    "ingredients",
    "instructions",
  ];
  const apiOptions: MyChatGPTAPIOptions = {
    completionParams: {
      model: menuRequest.chefLevel,
    },
    maxModelTokens: 8100,
  };

  const lambdaClient = new LambdaClient({ region: process.env.AWS_REGION });
  const possibleLeftoverRecipes = [
    ...new Set(
      menuRequest.avoidRecipes.map((recipe) => returnRecipeTitle(recipe)),
    ),
  ];
  const avoidRecipes = possibleLeftoverRecipes;

  const thisMonth = new Date().toLocaleString("default", { month: "long" });
  const thisWeeksMenu: Menu = {
    mains: [],
    salads: [],
    desserts: [],
  };

  for (let i = 1; i <= menuRequest.numberOfMains; i++) {
    const recipeProps: RecipeProps = {
      estimatedTime: 45,
      countryOfOrigin: "Denmark",
      timeOfYear: thisMonth,
      avoidIngredients: ["beet"],
      avoidProteins: [],
      avoidRecipes: [...new Set(avoidRecipes)],
      possibleLeftoverRecipes: [],
      systemOfMeasurement: "metric",
      substituteIngredients: [],
      servings: menuRequest.servings,
      type: "main course",
      diet: diets[Math.floor(Math.random() * diets.length)],
      possibleCuisines: await buildRandomCuisines(cuisines, 2),
    };

    const retrievalOptions: RecipeRetrievalOptions = {
      systemMessage: menuRequest.messageToChef,
      recipeProps,
      apiOptions,
      sendMessageOptions: {},
      necessaryProps: requiredRecipeProps,
      lambdaClient,
      chatFunctionName: process.env.CHAT_LAMBDA_NAME,
    };

    const recipe = await attemptRecipeRetrieval(retrievalOptions);

    if (!recipe || !recipe.recipe.title) {
      console.warn("Recipe or recipe title was missing");
      continue;
    }
    avoidRecipes.push(recipe.recipe.title);
    thisWeeksMenu.mains.push(recipe);
  }

  for (let i = 1; i <= menuRequest.numberOfSalads; i++) {
    const recipeProps: RecipeProps = {
      estimatedTime: 45,
      countryOfOrigin: "Denmark",
      timeOfYear: thisMonth,
      avoidIngredients: ["beet"],
      avoidProteins: [],
      avoidRecipes: [...new Set(avoidRecipes)],
      possibleLeftoverRecipes: [],
      systemOfMeasurement: "metric",
      substituteIngredients: [],
      servings: menuRequest.servings,
      type: "salad",
      diet: diets[Math.floor(Math.random() * diets.length)],
      possibleCuisines: await buildRandomCuisines(cuisines, 3),
    };

    const retrievalOptions: RecipeRetrievalOptions = {
      systemMessage: menuRequest.messageToChef,
      recipeProps,
      apiOptions,
      sendMessageOptions: {},
      necessaryProps: requiredRecipeProps,
      lambdaClient,
      chatFunctionName: process.env.CHAT_LAMBDA_NAME,
    };

    const recipe = await attemptRecipeRetrieval(retrievalOptions);

    if (!recipe || !recipe.recipe.title) {
      console.warn("Recipe or recipe title was missing");
      continue;
    }
    avoidRecipes.push(recipe.recipe.title);
    thisWeeksMenu.salads.push(recipe);
  }

  for (let i = 1; i <= menuRequest.numberOfDesserts; i++) {
    const recipeProps: RecipeProps = {
      estimatedTime: 45,
      countryOfOrigin: "Denmark",
      timeOfYear: thisMonth,
      avoidIngredients: [],
      avoidProteins: [],
      avoidRecipes: [...new Set(avoidRecipes)],
      possibleLeftoverRecipes: [],
      systemOfMeasurement: "metric",
      substituteIngredients: [],
      servings: menuRequest.servings,
      type: "dessert",
      diet: diets[Math.floor(Math.random() * diets.length)],
      possibleCuisines: await buildRandomCuisines(cuisines, 3),
    };

    const retrievalOptions: RecipeRetrievalOptions = {
      systemMessage: menuRequest.messageToChef,
      recipeProps,
      apiOptions,
      sendMessageOptions: {},
      necessaryProps: requiredRecipeProps,
      lambdaClient,
      chatFunctionName: process.env.CHAT_LAMBDA_NAME,
    };

    const recipe = await attemptRecipeRetrieval(retrievalOptions);

    if (!recipe || !recipe.recipe.title) {
      console.warn("Recipe or recipe title was missing");
      continue;
    }
    avoidRecipes.push(recipe.recipe.title);
    thisWeeksMenu.desserts.push(recipe);
  }

  return thisWeeksMenu;
};
