import {
  buildYearWeek,
  calculateWeekNumber,
  getPreviousYearWeek,
} from "./utils";

describe("calculateWeekNumber", () => {
  it("correctly calculates the first week of the year", async () => {
    expect(await calculateWeekNumber(new Date("2022-01-02"))).toEqual(1);
  });

  it("correctly calculates week when a year has 53 weeks", async () => {
    expect(await calculateWeekNumber(new Date("2020-12-31"))).toEqual(53);
  });
});

describe("buildYearWeek", () => {
  it("correctly concatenates year and week number", async () => {
    expect(await buildYearWeek(new Date("2022-01-02"))).toEqual("2022-1");
  });
});

describe("getPreviousWeekNumber", () => {
  it("correctly finds last year's week", async () => {
    expect(await getPreviousYearWeek(new Date("2022-01-02"))).toEqual(
      "2021-52",
    );
  });
});
