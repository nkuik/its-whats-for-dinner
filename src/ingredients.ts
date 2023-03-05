export type Protein =
  | "tofu"
  | "lentils"
  | "chickpeas"
  | "black beans"
  | "kidney beans"
  | "chicken"
  | "pork"
  | "cod"
  | "laks"
  | "salmon"
  | "beef";

type ProteinBase = {
  fish: ReadonlyArray<Protein>;
  vegetarian: ReadonlyArray<Protein>;
  nonVegetarian: ReadonlyArray<Protein>;
};

export const Protein: ProteinBase = {
  fish: ["cod", "laks", "salmon"],
  vegetarian: ["tofu", "lentils", "chickpeas", "black beans", "kidney beans"],
  nonVegetarian: ["chicken", "pork"],
} as const;

export type SeasonalIngredient =
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

export const fallIngredients: ReadonlyArray<SeasonalIngredient> = [
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

export const winterIngredients: ReadonlyArray<SeasonalIngredient> = [
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

export const summerIngredients: ReadonlyArray<SeasonalIngredient> = [
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

export const springIngredients: ReadonlyArray<SeasonalIngredient> = [
  "chives",
  "Jerusalem artichoke",
  "oyster mushroom",
];
