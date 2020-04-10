import { isTouch, isDrawableElement } from "../../src/utils/utils";

describe("isTouch", () => {
  it("should return false", () => {
    // in ChromeHeadless
    expect(isTouch()).toBeFalsy();
  });
});

describe("isDrawableElement", () => {
  it("should return true", () => {
    const els = [
      document.createElement("img"),
      new Image(),
      document.createElement("video"),
      document.createElement("canvas"),
    ];
    for (const el of els) {
      expect(isDrawableElement(el)).toBeTruthy();
    }
  });

  it("should return false", () => {
    const els = [document.createElement("p"), document.createElement("audio")];
    for (const el of els) {
      expect(isDrawableElement(el)).toBeFalsy();
    }
  });
});
