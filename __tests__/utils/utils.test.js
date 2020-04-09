import {
  isTouch,
  isTransparent,
  isDrawableElement,
} from "../../src/utils/utils";

describe("isTouch", () => {
  it("should return false", () => {
    // in ChromeHeadless
    expect(isTouch()).toBeFalsy();
  });
});

describe("isTransparent", () => {
  it("should return true", () => {
    const colors = [
      "transparent",
      "rgba(0,0,0,0)",
      "rgba( 1, 2, 3, 0 )",
      "hsl(10%, 20%, 30%, 0)",
    ];
    for (const color of colors) {
      expect(isTransparent(color)).toBeTruthy();
    }
  });

  it("should return false", () => {
    const colors = [
      "",
      "orange",
      "rgb(1,2,3)",
      "rgba(0,0,0,0.1)",
      "hsla(3,4,5,1)",
    ];
    for (const color of colors) {
      expect(isTransparent(color)).toBeFalsy();
    }
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
