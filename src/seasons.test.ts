import { Fall, Spring, Summer, Winter, findSeason } from "./seasons";

describe("Season helpers", () => {
  it("can find spring based on the date", async () => {
    expect(
      await findSeason(new Date(`${new Date().getFullYear()}-04-20`)),
    ).toBe(Spring);
    expect(
      await findSeason(new Date(`${new Date().getFullYear()}-06-20`)),
    ).toBe(Spring);
  });

  it("can find summer based on the date", async () => {
    expect(
      await findSeason(new Date(`${new Date().getFullYear()}-06-21`)),
    ).toBe(Summer);
    expect(
      await findSeason(new Date(`${new Date().getFullYear()}-09-22`)),
    ).toBe(Summer);
  });

  it("can find fall based on the date", async () => {
    expect(
      await findSeason(new Date(`${new Date().getFullYear()}-09-23`)),
    ).toBe(Fall);
    expect(
      await findSeason(new Date(`${new Date().getFullYear()}-12-20`)),
    ).toBe(Fall);
  });

  it("can find winter based on the date", async () => {
    expect(
      await findSeason(new Date(`${new Date().getFullYear()}-12-21`)),
    ).toBe(Winter);
    expect(
      await findSeason(new Date(`${new Date().getFullYear()}-04-19`)),
    ).toBe(Winter);
  });
});
