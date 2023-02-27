export type Cuisine =
  | "African"
  | "American"
  | "British"
  | "Cajun"
  | "Caribbean"
  | "Chinese"
  | "Eastern European"
  | "European"
  | "French"
  | "German"
  | "Greek"
  | "Indian"
  | "Irish"
  | "Italian"
  | "Japanese"
  | "Jewish"
  | "Korean"
  | "Latin American"
  | "Mediterranean"
  | "Mexican"
  | "Middle Eastern"
  | "Nordic"
  | "Southern"
  | "Spanish"
  | "Thai"
  | "Vietnamese";

export type MealType =
  | "main course"
  | "side dish"
  | "dessert"
  | "appetizer"
  | "salad"
  | "bread"
  | "breakfast"
  | "soup"
  | "beverage"
  | "sauce"
  | "marinade"
  | "fingerfood"
  | "snack"
  | "drink";

export type Diet = "omnivore" | "pescatarian" | "vegan" | "vegetarian";

export type ComplexRecipeSearchParams = {
  endpoint: "https://api.spoonacular.com/recipes/complexSearch";
  type: MealType;
  cuisines: ReadonlyArray<Cuisine>;
  diets: ReadonlyArray<Diet>;
  maxReadyTime: number;
};
