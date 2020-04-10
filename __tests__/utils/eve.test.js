import { Eve } from "../../src/utils/eve";

describe("utils/eve", () => {
  it("should fire event", (done) => {
    const ev = new Eve();
    ev.on("yo", done);
    ev.trigger("yo");
  });

  it("should fire event w/ arguments", (done) => {
    const ev = new Eve();
    ev.on("yo", (data) => {
      expect(data).toBe("hello");
      done();
    });
    ev.trigger("yo", "hello");
  });

  it("should fire event multiple", (done) => {
    const ev = new Eve();
    let count = 0;
    ev.on("foo", countUpAndDone);
    ev.on("foo", countUpAndDone);
    ev.trigger("foo");

    function countUpAndDone() {
      count++;
      if (count === 2) done();
    }
  });

  it("should not fire event", (done) => {
    const ev = new Eve();
    ev.on("bye", done.fail);
    ev.off("bye");
    ev.trigger("bye");
    done();
  });

  it("should not fire event multiple", (done) => {
    const ev = new Eve();
    ev.on("bye", done.fail);
    ev.on("byebye", done.fail);
    ev.removeAllListeners();
    ev.trigger("bye");
    ev.trigger("byebye");
    done();
  });

  it("should fire event again", (done) => {
    const ev = new Eve();
    ev.on("bye", done.fail);
    ev.off("bye");
    ev.on("bye", done);
    ev.trigger("bye");
  });

  it("should call handleEvent", (done) => {
    const ev = new Eve();
    class Handler {
      handleEvent(data) {
        expect(data).toBe(1);
        done();
      }
    }
    ev.on("handle", new Handler());
    ev.trigger("handle", 1);
  });
});
