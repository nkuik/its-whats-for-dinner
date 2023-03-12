import { Context, EventBridgeEvent } from "aws-lambda";
import { RecipeAndChatMessage } from "../../recipes/recipes";

const lambdaHandler = async (
  event: EventBridgeEvent<"Scheduled Event", any>,
  context: Context,
): Promise<Array<RecipeAndChatMessage>> => {
  return [];
};
