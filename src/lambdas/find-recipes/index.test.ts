import { buildRandomCuisines } from ".";

describe("buildRandomCuisines", () => {
  it("returns provided cuisines if numberToFind too large", async () => {
    expect(
      await buildRandomCuisines(["American", "European"], 3),
    ).toStrictEqual(["American", "European"]);
  });

  it("randomly selects provided number of cuisines", async () => {
    expect(
      await buildRandomCuisines(
        ["American", "European", "Asian", "Latin American"],
        2,
      ),
    ).toHaveLength(2);
  });
});
