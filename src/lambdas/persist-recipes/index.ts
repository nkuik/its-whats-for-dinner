import { Context } from "aws-lambda";
import { RecipeAndChatMessage } from "../../recipes/recipes";

type RecipeRecord = {
  [year: string]: {
    [weekNumber: string]: Array<RecipeAndChatMessage>;
  };
};

const lambdaHandler = async (
  event: Array<RecipeAndChatMessage>,
  context: Context,
): Promise<Array<RecipeAndChatMessage>> => {
  return [];
};
