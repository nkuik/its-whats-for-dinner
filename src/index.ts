import { Fall, Season, Spring, Summer, Winter } from "./types/ingredients";
import { ComplexRecipeSearchParams } from "./types/spoonacular";

export const findSeason = async (dateObj: Date): Promise<Season> => {
  if (Spring.firstDay <= dateObj && dateObj < Summer.firstDay) {
    return Spring;
  } else if (Summer.firstDay <= dateObj && dateObj < Fall.firstDay) {
    return Summer;
  } else if (Fall.firstDay <= dateObj && dateObj < Winter.firstDay) {
    return Fall;
  }
  return Winter;
};

export const transformParamsSpoonacular = async (
  params: ReadonlyArray<string>,
  operator: "AND" | "OR",
): Promise<string> => {
  if (!params.length) {
    throw new Error("No params provided");
  }
  if (operator === "AND") {
    return params.join(",");
  }
  return params.join("|");
};

export const makeComplexRecipeSearch = async (
  params: ComplexRecipeSearchParams,
): Promise<ComplexRecipeSearchResponse> => {};
