import { Eve } from "./utils/eve";
import { Stack } from "./utils/stack";
import { isTouch } from "./utils/utils";

export class SimpleDrawingBoard {
  constructor($el, { historyDepth }) {
    this._$el = $el;
    this._ctx = this._$el.getContext("2d");

    // handwriting fashion ;D
    this._ctx.lineCap = this._ctx.lineJoin = "round";

    // for canvas operation
    this._isDrawMode = true;

    // for drawing
    this._isDrawing = false;
    this._timer = null;
    this._coords = {
      old: { x: 0, y: 0 },
      oldMid: { x: 0, y: 0 },
      current: { x: 0, y: 0 },
    };

    this._ev = new Eve();
    this._history = {
      // for undo
      prev: new Stack({ depth: historyDepth }),
      // for redo
      next: new Stack({ depth: historyDepth }),
    };

    this._bindEvents();
    this._drawFrame();
  }

  get ev() {
    return this._ev;
  }

  setLineSize(size) {
    this._ctx.lineWidth = size | 0 || 1;

    return this;
  }

  setLineColor(color) {
    this._ctx.strokeStyle = color;

    return this;
  }

  fill(color) {
    // TODO
    // this._saveHistory();

    const ctx = this._ctx;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    return this;
  }

  clear() {
    // TODO
    // this._saveHistory();

    const ctx = this._ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    return this;
  }

  toggleMode() {
    this._ctx.globalCompositeOperation = this._isDrawMode
      ? "destination-out"
      : "source-over";
    this._isDrawMode = !this._isDrawMode;

    return this;
  }

  getImageDataURL({ type, quality } = {}) {
    return this._ctx.canvas.toDataURL(type, quality);
  }
  // TODO: name
  setImg() {}

  async undo() {}
  async redo() {}
  dispose() {}

  handleEvent(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    switch (ev.type) {
      case "mousedown":
      case "touchstart":
        this._onInputDown(ev);
        break;
      case "mousemove":
      case "touchmove":
        this._onInputMove(ev);
        break;
      case "mouseup":
      case "touchend":
        this._onInputUp();
        break;
      case "mouseout":
      case "touchcancel":
      case "gesturestart":
        this._onInputCancel();
        break;
      default:
    }
  }

  _bindEvents() {
    const events = isTouch()
      ? ["touchstart", "touchmove", "touchend", "touchcancel", "gesturestart"]
      : ["mousedown", "mousemove", "mouseup", "mouseout"];

    for (const ev of events) {
      this._$el.addEventListener(ev, this, false);
    }
  }
  _unbindEvents() {
    const events = isTouch()
      ? ["touchstart", "touchmove", "touchend", "touchcancel", "gesturestart"]
      : ["mousedown", "mousemove", "mouseup", "mouseout"];

    for (const ev of events) {
      this._$el.removeEventListener(ev, this, false);
    }
  }

  _drawFrame() {
    this._timer = requestAnimationFrame(() => this._drawFrame());

    if (!this._isDrawing) return;

    const isSameCoords =
      this._coords.old.x === this._coords.current.x &&
      this._coords.old.y === this._coords.current.y;

    const currentMid = this._getMidInputCoords(this._coords.current);
    const ctx = this._ctx;

    ctx.beginPath();
    ctx.moveTo(currentMid.x, currentMid.y);
    ctx.quadraticCurveTo(
      this._coords.old.x,
      this._coords.old.y,
      this._coords.oldMid.x,
      this._coords.oldMid.y
    );
    ctx.stroke();

    this._coords.old = this._coords.current;
    this._coords.oldMid = currentMid;

    if (!isSameCoords) this._ev.trigger("draw", this._coords.current);
  }

  _onInputDown(ev) {
    // TODO
    // this._saveHistory();
    this._isDrawing = true;

    const coords = this._getInputCoords(ev);
    this._coords.current = this._coords.old = coords;
    this._coords.oldMid = this._getMidInputCoords(coords);

    this._ev.trigger("drawBegin", this._coords.current);
  }
  _onInputMove(ev) {
    this._coords.current = this._getInputCoords(ev);
  }
  _onInputUp() {
    this._isDrawing = false;
    this._ev.trigger("drawEnd", this._coords.current);
  }
  _onInputCancel() {
    if (this._isDrawing) {
      this._ev.trigger("drawEnd", this._coords.current);
    }
    this._isDrawing = false;
  }

  // TODO: just function
  _getInputCoords(ev) {
    let x, y;
    if (isTouch()) {
      x = ev.touches[0].pageX;
      y = ev.touches[0].pageY;
    } else {
      x = ev.pageX;
      y = ev.pageY;
    }

    // いつリサイズされてもよいようリアルタイムに
    const elBCRect = this._$el.getBoundingClientRect();

    // スクロールされた状態でリロードすると、位置ズレするので加味する
    const elRect = {
      left: elBCRect.left + window.pageXOffset,
      top: elBCRect.top + window.pageYOffset,
    };
    // canvasのstyle指定に対応する
    const elScale = {
      x: this._$el.width / elBCRect.width,
      y: this._$el.height / elBCRect.height,
    };

    return {
      x: (x - elRect.left) * elScale.x,
      y: (y - elRect.top) * elScale.y,
    };
  }
  _getMidInputCoords(coords) {
    return {
      x: (this._coords.old.x + coords.x) >> 1,
      y: (this._coords.old.y + coords.y) >> 1,
    };
  }
}
