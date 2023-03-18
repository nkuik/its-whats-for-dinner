import { Context } from "aws-lambda";
import { RecipeAndChatMessage } from "../../recipes/recipes";

type RecipeRecord = {
  yearWeek: string;
  recipes: RecipeAndChatMessage[];
};

const lambdaHandler = async (
  event: Array<RecipeAndChatMessage>,
  context: Context,
): Promise<Array<RecipeAndChatMessage>> => {
  return [];
};
