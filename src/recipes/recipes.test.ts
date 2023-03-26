import { formatList, parseRecipe } from "./recipes";

describe("formatList", () => {
  it("returns 'None' when empty list provided as argument", () => {
    expect(formatList([])).toEqual("None");
  });

  it("returns a single bullet point when provided one item", () => {
    expect(formatList(["blah"])).toEqual("- blah");
  });

  it("returns a multiple bullet points when provided multiple items", () => {
    expect(formatList(["this", "that"])).toEqual("- this\n- that");
  });
});

describe("parseRecipe", () => {
  it("throws an error if the recipe cannot be parsed", async () => {
    await expect(parseRecipe("blah", [])).rejects.toThrow(
      "Error parsing recipe JSON",
    );
  });

  it("throws an error if the recipe does not contain necessary fields", async () => {
    await expect(
      parseRecipe('{"title": "Amazing Stew"}', ["ingredients"]),
    ).rejects.toThrow("Recipe missing necessary item: ingredients");
  });
});
