import { LambdaClient } from "@aws-sdk/client-lambda";
import { Context } from "aws-lambda";
import { Menu, MenuRequest } from "../../menu";
import {
  Diet,
  Recipe,
  RecipeAndChatMessage,
  RecipeProps,
  RecipeRetrievalOptions,
  attemptRecipeRetrieval,
} from "../../recipes/recipes";

const systemMessage = `You are a chef living in Denmark. You recommend creative recipes with concise directions.`;

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
  recipeRequest: MenuRequest,
  context: Context,
): Promise<Menu> => {
  console.log("recipes: ", recipeRequest);
  console.log("context: ", context);

  if (!process.env.CHAT_LAMBDA_NAME) {
    throw new Error("Env var CHAT_LAMBDA_NAME must be set!");
  }

  const cuisines = [
    "Italian",
    "Mexican",
    "Japanese",
    "Middle Eastern",
    "New Nordic",
    "Korean",
    "Mediterranean",
    "Fusion",
  ];
  const diets: Diet[] = ["omnivore", "pescatarian", "vegetarian", "vegan"];
  const requiredRecipeProps: (keyof Recipe)[] = [
    "title",
    "type",
    "estimatedTime",
    "ingredients",
    "instructions",
  ];

  const lambdaClient = new LambdaClient({ region: process.env.AWS_REGION });
  const possibleLeftoverRecipes = recipeRequest.avoidRecipes.map((recipe) =>
    returnRecipeTitle(recipe),
  );
  const avoidRecipes = possibleLeftoverRecipes;

  const thisMonth = new Date().toLocaleString("default", { month: "long" });
  const thisWeeksMenu: Menu = {
    mains: [],
    salads: [],
    desserts: [],
  };

  for (let i = 1; i <= recipeRequest.numberOfMains; i++) {
    const recipeProps: RecipeProps = {
      estimatedTime: 45,
      countryOfOrigin: "Denmark",
      timeOfYear: thisMonth,
      avoidIngredients: ["beet"],
      avoidProteins: ["beef"],
      avoidRecipes,
      possibleLeftoverRecipes,
      systemOfMeasurement: "metric",
      substituteIngredients: [],
      servings: 2,
      type: "main course",
      diet: diets[Math.floor(Math.random() * diets.length)],
      possibleCuisines: await buildRandomCuisines(cuisines, 3),
    };

    const retrievalOptions: RecipeRetrievalOptions = {
      systemMessage,
      recipeProps,
      apiOptions: {},
      sendMessageOptions: {},
      necessaryProps: requiredRecipeProps,
      lambdaClient,
      chatFunctionName: process.env.CHAT_LAMBDA_NAME,
    };

    const recipe = await attemptRecipeRetrieval(retrievalOptions);

    if (!recipe || !recipe.recipe.title) {
      throw new Error("No recipe found after making multiple attempts");
    }
    avoidRecipes.push(recipe.recipe.title);
    thisWeeksMenu.mains.push(recipe);
  }

  for (let i = 1; i <= recipeRequest.numberOfSalads; i++) {
    const recipeProps: RecipeProps = {
      estimatedTime: 45,
      countryOfOrigin: "Denmark",
      timeOfYear: thisMonth,
      avoidIngredients: ["beet"],
      avoidProteins: ["beef"],
      avoidRecipes,
      possibleLeftoverRecipes,
      systemOfMeasurement: "metric",
      substituteIngredients: [],
      servings: 2,
      type: "salad",
      diet: diets[Math.floor(Math.random() * diets.length)],
      possibleCuisines: await buildRandomCuisines(cuisines, 2),
    };

    const retrievalOptions: RecipeRetrievalOptions = {
      systemMessage,
      recipeProps,
      apiOptions: {},
      sendMessageOptions: {},
      necessaryProps: requiredRecipeProps,
      lambdaClient,
      chatFunctionName: process.env.CHAT_LAMBDA_NAME,
    };

    const recipe = await attemptRecipeRetrieval(retrievalOptions);

    if (!recipe || !recipe.recipe.title) {
      throw new Error("No recipe found after making multiple attempts");
    }
    avoidRecipes.push(recipe.recipe.title);
    thisWeeksMenu.salads.push(recipe);
  }

  return thisWeeksMenu;
};
