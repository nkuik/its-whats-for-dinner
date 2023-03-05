import { formatList } from "./recipes";

describe("formatList", () => {
  it("returns empty string when empty list provided as argument", async () => {
    expect(await formatList([])).toEqual("");
  });

  it("returns a single bullet point when provided one item", async () => {
    expect(await formatList(["blah"])).toEqual("- blah");
  });

  it("returns a multiple bullet points when provided multiple items", async () => {
    expect(await formatList(["this", "that"])).toEqual("- this\n- that");
  });
});
