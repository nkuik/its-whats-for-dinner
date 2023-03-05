import { findSeason } from "./seasons";

describe("Season helpers", () => {
  it("can find spring based on the date", async () => {
    expect(
      await findSeason(new Date(`${new Date().getFullYear()}-04-20`)),
    ).toBe("spring");
    expect(
      await findSeason(new Date(`${new Date().getFullYear()}-06-20`)),
    ).toBe("spring");
  });

  it("can find summer based on the date", async () => {
    expect(
      await findSeason(new Date(`${new Date().getFullYear()}-06-21`)),
    ).toBe("summer");
    expect(
      await findSeason(new Date(`${new Date().getFullYear()}-09-22`)),
    ).toBe("summer");
  });

  it("can find fall based on the date", async () => {
    expect(
      await findSeason(new Date(`${new Date().getFullYear()}-09-23`)),
    ).toBe("autumn");
    expect(
      await findSeason(new Date(`${new Date().getFullYear()}-12-20`)),
    ).toBe("autumn");
  });

  it("can find winter based on the date", async () => {
    expect(
      await findSeason(new Date(`${new Date().getFullYear()}-12-21`)),
    ).toBe("winter");
    expect(
      await findSeason(new Date(`${new Date().getFullYear()}-04-19`)),
    ).toBe("winter");
  });
});
