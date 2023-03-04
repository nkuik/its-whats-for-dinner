import {
  fallIngredients,
  SeasonalIngredient,
  springIngredients,
  summerIngredients,
  winterIngredients,
} from "./ingredients";

export type Season = {
  season: "winter" | "fall" | "spring" | "summer";
  seasonalIngredients: ReadonlyArray<SeasonalIngredient>;
  ingredientsToAvoid: ReadonlyArray<SeasonalIngredient>;
  firstDay: Date;
};

export const Spring: Season = {
  season: "spring",
  seasonalIngredients: springIngredients,
  ingredientsToAvoid: [
    ...fallIngredients,
    ...winterIngredients,
    ...summerIngredients,
  ],
  firstDay: new Date(`${new Date().getFullYear()}-04-20`),
} as const;

export const Summer: Season = {
  season: "summer",
  seasonalIngredients: summerIngredients,
  ingredientsToAvoid: [
    ...fallIngredients,
    ...winterIngredients,
    ...springIngredients,
  ],
  firstDay: new Date(`${new Date().getFullYear()}-06-21`),
} as const;

export const Fall: Season = {
  season: "fall",
  seasonalIngredients: fallIngredients,
  ingredientsToAvoid: [
    ...winterIngredients,
    ...summerIngredients,
    ...springIngredients,
  ],
  firstDay: new Date(`${new Date().getFullYear()}-09-23`),
} as const;

export const Winter: Season = {
  season: "winter",
  seasonalIngredients: winterIngredients,
  ingredientsToAvoid: [
    ...fallIngredients,
    ...summerIngredients,
    ...springIngredients,
  ],
  firstDay: new Date(`${new Date().getFullYear()}-12-21`),
} as const;

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
