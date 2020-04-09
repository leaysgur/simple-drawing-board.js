import { Stack } from "../../src/utils/stack";

describe("Stack", () => {
  it("should push", () => {
    const stack = new Stack();
    expect(stack.size).toBe(0);
    stack.push("hi");
    expect(stack.size).toBe(1);
  });

  it("should pop", () => {
    const stack = new Stack();
    stack.push("yo");
    stack.push("yoyo");

    expect(stack.pop()).toBe("yoyo");
    expect(stack.pop()).toBe("yo");
  });

  it("should get item", () => {
    const stack = new Stack();
    stack.push("yo");
    stack.push("yoyo");

    expect(stack.get(0)).toBe("yo");
    expect(stack.get(1)).toBe("yoyo");
  });

  it("should limit by depth", () => {
    const stack = new Stack({ depth: 2 });
    stack.push(1);
    stack.push(2);
    stack.push(3);
    stack.push(4);

    expect(stack.size).toBe(2);
    expect(stack.get(0)).toBe(3);
  });

  it("should clear", () => {
    const stack = new Stack();
    stack.push(1);
    stack.push(2);

    expect(stack.size).toBe(2);

    stack.clear();
    expect(stack.size).toBe(0);
  });
});
