type Protein =
  | "tofu"
  | "lentils"
  | "chickpeas"
  | "black beans"
  | "kidney beans"
  | "chicken"
  | "pork"
  | "cod"
  | "laks"
  | "salmon";

type ProteinBase = {
  fish: ReadonlyArray<Protein>;
  vegetarian: ReadonlyArray<Protein>;
  nonVegetarian: ReadonlyArray<Protein>;
};

const Protein: ProteinBase = {
  fish: ["cod", "laks", "salmon"],
  vegetarian: ["tofu", "lentils", "chickpeas", "black beans", "kidney beans"],
  nonVegetarian: ["chicken", "pork"],
} as const;

type SeasonalIngredient =
  | "beet"
  | "Brussels sprout"
  | "Chinese cabbage"
  | "kale"
  | "leek"
  | "parsnips"
  | "parsley root"
  | "potato"
  | "squash"
  | "apple"
  | "broccoli"
  | "carrot"
  | "cauliflower"
  | "celery"
  | "grape"
  | "green bean"
  | "lettuce"
  | "plum"
  | "pumpkin"
  | "radish"
  | "asparagus"
  | "berry"
  | "blackberry"
  | "corn"
  | "cherry"
  | "pear"
  | "rhubarb"
  | "raspberry"
  | "strawberry"
  | "watermelon"
  | "chives"
  | "Jerusalem artichoke"
  | "oyster mushroom";

export type Season = {
  season: "winter" | "fall" | "spring" | "summer";
  seasonalIngredients: ReadonlyArray<SeasonalIngredient>;
  ingredientsToAvoid: ReadonlyArray<SeasonalIngredient>;
  firstDay: Date,
};

const fallIngredients: ReadonlyArray<SeasonalIngredient> = [
  "apple",
  "broccoli",
  "carrot",
  "cauliflower",
  "celery",
  "grape",
  "green bean",
  "lettuce",
  "plum",
  "pumpkin",
  "radish",
];

const winterIngredients: ReadonlyArray<SeasonalIngredient> = [
  "beet",
  "Brussels sprout",
  "Chinese cabbage",
  "kale",
  "leek",
  "parsnips",
  "parsley root",
  "potato",
  "squash",
];

const summerIngredients: ReadonlyArray<SeasonalIngredient> = [
  "asparagus",
  "berry",
  "blackberry",
  "corn",
  "cherry",
  "pear",
  "rhubarb",
  "raspberry",
  "strawberry",
  "watermelon",
];

const springIngredients: ReadonlyArray<SeasonalIngredient> = [
  "chives",
  "Jerusalem artichoke",
  "oyster mushroom",
];

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
};

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
