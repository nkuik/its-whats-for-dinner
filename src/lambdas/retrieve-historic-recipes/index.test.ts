import { calculateWeekNumber } from ".";

describe("calculateWeekNumber", () => {
  it("correctly calculates the first week of the year", async () => {
    expect(await calculateWeekNumber(new Date("2022-01-02"))).toEqual(1);
  });

  it("correctly calculates week when a year has 53 weeks", async () => {
    expect(await calculateWeekNumber(new Date("2020-12-31"))).toEqual(53);
  });
});
