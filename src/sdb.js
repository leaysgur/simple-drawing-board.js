import { Eve } from "./utils/eve";
import { Stack } from "./utils/eve";

export class SimpleDrawingBoard {
  constructor($el, options) {
    this._$el = $el;

    this._ev = new Eve();
    this._ctx = this._$el.getContext("2d");

    this._isDrawing = false;
    this._timer = null;
    this._coords = {
      old: { x: 0, y: 0 },
      oldMid: { x: 0, y: 0 },
      current: { x: 0, y: 0 }
    };
    this._history = {
      // for undo
      prev: new Stack({ depth: options.historyDepth }),
      // for redo
      next: new Stack({ depth: options.historyDepth })
    };

    this._settings = {
      lineColor: "#aaa",
      lineSize: 5,
      boardColor: "transparent",
      historyDepth: 10,
      isTransparent: 1,
      isDrawMode: 1
    };
  }

  get observer() {
    return this._eve;
  }
}
