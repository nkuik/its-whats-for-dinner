import { RecipeAndChatMessage } from "./recipes/recipes";

export type MenuRequest = {
  servings: number;
  numberOfMains: number;
  numberOfSalads: number;
  numberOfDesserts: number;
  avoidRecipes: RecipeAndChatMessage[];
};

export type Menu = {
  mains: RecipeAndChatMessage[];
  salads: RecipeAndChatMessage[];
  desserts: RecipeAndChatMessage[];
};
