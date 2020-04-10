import { History } from "../../src/utils/history";

describe("utils/history", () => {
  it("should apply initialValue", () => {
    const history = new History();
    expect(history.value).toBe(null);
    const history2 = new History(0);
    expect(history2.value).toBe(0);
  });

  it("should save", () => {
    const history = new History();
    expect(history.value).toBe(null);
    history.save(1);
    expect(history.value).toBe(1);
    history.save(2);
    expect(history.value).toBe(2);
  });

  it("should undo", () => {
    const history = new History();
    history.save(1);
    history.save(2);
    history.undo();
    expect(history.value).toBe(1);
  });

  it("should not undo w/o save", () => {
    const history = new History();
    history.undo();
    expect(history.value).toBe(null);
  });

  it("should undo more", () => {
    const history = new History();
    history.save(1);
    history.save(2);
    history.undo();
    history.undo();
    expect(history.value).toBe(null);
  });

  it("should redo", () => {
    const history = new History();
    history.save(1);
    history.undo();
    history.redo();
    expect(history.value).toBe(1);
  });

  it("should not redo w/o undo", () => {
    const history = new History();
    history.save(1);
    history.redo();
    expect(history.value).toBe(1);
  });

  it("should redo more", () => {
    const history = new History();
    history.save(1);
    history.undo();
    history.save(1);
    history.save(2);
    history.save(3);
    history.undo();
    history.undo();
    history.undo();
    history.redo();
    expect(history.value).toBe(1);
    history.redo();
    expect(history.value).toBe(2);
    history.redo();
    expect(history.value).toBe(3);
  });

  it("should save to clean future", () => {
    const history = new History();
    history.save(1);
    history.save(2);
    history.save(3);
    history.undo();
    history.undo();
    history.undo();
    history.redo();
    expect(history.value).toBe(1);
    history.save(10);
    history.redo();
    expect(history.value).toBe(10);
  });

  it("should clear", () => {
    const history = new History();
    history.save(1);
    history.save(2);
    history.clear();
    history.undo();
    expect(history.value).toBe(2);
  });
});
