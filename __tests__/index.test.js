import { create } from "../src/index";

describe("index#create()", () => {
  it("should create sdb", (done) => {
    const $canvas = document.createElement("canvas");
    try {
      const sdb = create($canvas);
      sdb.destroy();
      done();
    } catch (err) {
      done.fail();
    }
  });

  it("should throw", (done) => {
    const $non = document.createElement("div");
    try {
      const sdb = create($non);
      sdb.destroy();
      done.fail();
    } catch (err) {
      done();
    }
  });
});
