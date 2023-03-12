import { Context } from "aws-lambda";
import { RecipeAndChatMessage } from "../../recipes/recipes";

const lambdaHandler = async (
  event: Array<RecipeAndChatMessage>,
  context: Context,
): Promise<void> => {
  return;
};
