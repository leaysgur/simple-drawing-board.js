import {
  isTouch,
  isDrawableElement,
  isBase64DataURL,
} from "../../src/utils/dom";

describe("utils/dom#isTouch", () => {
  it("should return false", () => {
    // in ChromeHeadless
    expect(isTouch()).toBeFalsy();
  });
});

describe("utils/dom#isDrawableElement", () => {
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

describe("utils/dom#isBase64DataURL", () => {
  it("should return true", () => {
    const urls = ["data:image/png", "data:image/jpeg"];
    for (const url of urls) {
      expect(isBase64DataURL(url)).toBeTruthy();
    }
  });

  it("should return false", () => {
    const urls = ["data:video/mpeg", "", new Image()];
    for (const url of urls) {
      expect(isBase64DataURL(url)).toBeFalsy();
    }
  });
});
