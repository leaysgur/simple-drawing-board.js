import { SimpleDrawingBoard } from "../src/sdb";

let sdb;
beforeEach(() => {
  sdb = new SimpleDrawingBoard(document.createElement("canvas"));
});

describe("sdb#toDataURL()", () => {
  it("should return data URL", () => {
    const url = sdb.toDataURL();
    expect(typeof url).toBe("string");
    expect(url.startsWith("data:image/png;base64,")).toBeTruthy();
  });

  it("should return data URL w/ valid type", () => {
    const url = sdb.toDataURL({ type: "image/jpeg" });
    expect(typeof url).toBe("string");
    expect(url.startsWith("data:image/jpeg")).toBeTruthy();
  });

  it("should return data URL w/ invalid type", () => {
    const url = sdb.toDataURL({ type: "image" });
    expect(typeof url).toBe("string");
    expect(url.startsWith("data:image/png")).toBeTruthy();
  });

  it("should return different URL after operation", () => {
    const url1 = sdb.toDataURL();
    sdb.fill("black");
    const url2 = sdb.toDataURL();
    expect(url1).not.toBe(url2);
  });
});

describe("sdb#clear()", () => {
  it("should clear", () => {
    const url1 = sdb.toDataURL();
    sdb.fill("red");
    sdb.clear();
    const url2 = sdb.toDataURL();
    expect(url1).toBe(url2);
  });
});

describe("sdb#toggleMode()", () => {
  it("should toggle mode", () => {
    expect(sdb.mode).toBe("draw");
    sdb.toggleMode();
    expect(sdb.mode).toBe("erase");
    sdb.toggleMode();
    expect(sdb.mode).toBe("draw");
  });
});

describe("sdb#fillImageByElement()", () => {
  it("should set canvas element", async () => {
    const sdb1 = new SimpleDrawingBoard(document.createElement("canvas"));
    const sdb2 = new SimpleDrawingBoard(document.createElement("canvas"));

    sdb1.fill("orange");
    const url1 = sdb1.toDataURL();

    sdb2.fillImageByElement(sdb1.canvas);
    const url2 = sdb2.toDataURL();

    expect(url1).toBe(url2);
  });
});

describe("sdb#fillImageByDataURL()", () => {
  it("should set png", async () => {
    sdb.fill("black");
    const url1 = sdb.toDataURL({ type: "image/png" });

    sdb.clear();
    await sdb.fillImageByDataURL(url1);
    const url2 = sdb.toDataURL();
    expect(url1).toBe(url2);
  });

  it("should set jpeg", async () => {
    sdb.fill("blue");
    const url1 = sdb.toDataURL({ type: "image/jpeg" });

    sdb.clear();
    await sdb.fillImageByDataURL(url1);
    const url2 = sdb.toDataURL({ type: "image/jpeg" });
    expect(url1).toBe(url2);
  });
});

describe("sdb#undo() + redo()", () => {
  it("should undo", async () => {
    const url1 = sdb.toDataURL();
    sdb.fill("black");
    await sdb.undo();
    const url2 = sdb.toDataURL();
    expect(url1).toBe(url2);
  });

  it("should undo more", async () => {
    sdb.fill("black");
    const url1 = sdb.toDataURL();
    sdb.fill("red");
    sdb.fill("green");
    await sdb.undo();
    await sdb.undo();
    const url2 = sdb.toDataURL();
    expect(url1).toBe(url2);
  });

  it("should undo+redo", async () => {
    sdb.fill("black");
    const url1 = sdb.toDataURL();
    await sdb.undo();
    await sdb.redo();
    const url2 = sdb.toDataURL();
    expect(url1).toBe(url2);
  });

  it("should not do nothing undo end", async () => {
    const url1 = sdb.toDataURL();
    await sdb.redo();
    await sdb.redo();
    sdb.fill("black");
    await sdb.undo();
    await sdb.undo();
    await sdb.undo();
    await sdb.redo();
    const url2 = sdb.toDataURL();
    expect(url1).not.toBe(url2);
  });
});

describe("sdb#destroy()", () => {
  it("should not emit event anymore", (done) => {
    sdb.observer.on("save", done.fail);
    sdb.destroy();
    sdb.fill("green");
    done();
  });
});

describe("sdb#observer", () => {
  it("should expose", (done) => {
    sdb.observer.on("save", done);
    sdb.fill("green");
  });
});

describe("sdb#canvas", () => {
  it("should trigger save event", () => {
    const $canvas = document.createElement("canvas");
    const sdb = new SimpleDrawingBoard($canvas);

    expect(sdb.canvas).toBe($canvas);
  });
});
