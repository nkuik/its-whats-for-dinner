import { RecipeAndChatMessage } from "./recipes/recipes";

export type MenuRequest = {
  servings: number;
  numberOfMains: number;
  numberOfSalads: number;
  numberOfDesserts: number;
  avoidRecipes: RecipeAndChatMessage[];
  messageToChef: string;
  chefLevel: "gpt-3.5-turbo-0301" | "gpt-4";
};

export type Menu = {
  mains: RecipeAndChatMessage[];
  salads: RecipeAndChatMessage[];
  desserts: RecipeAndChatMessage[];
};
