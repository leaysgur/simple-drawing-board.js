import { Eve } from "./utils/eve";
import { History } from "./utils/history";
import {
  isTouch,
  isDrawableElement,
  isBase64DataURL,
  loadImage,
  getMidInputCoords,
  getInputCoords,
} from "./utils/dom";

export class SimpleDrawingBoard {
  constructor($el) {
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
    this._history = new History(this.toDataURL());

    this._bindEvents();
    this._drawFrame();
  }

  get canvas() {
    return this._$el;
  }

  get observer() {
    return this._ev;
  }

  get mode() {
    return this._isDrawMode ? "draw" : "erase";
  }

  setLineSize(size) {
    this._ctx.lineWidth = size | 0 || 1;
  }

  setLineColor(color) {
    this._ctx.strokeStyle = color;
  }

  fill(color) {
    const ctx = this._ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this._saveHistory();
  }

  clear() {
    const ctx = this._ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this._saveHistory();
  }

  toggleMode() {
    this._ctx.globalCompositeOperation = this._isDrawMode
      ? "destination-out"
      : "source-over";
    this._isDrawMode = !this._isDrawMode;
  }

  toDataURL({ type, quality } = {}) {
    return this._ctx.canvas.toDataURL(type, quality);
  }

  fillImageByElement($el, { isOverlay = false } = {}) {
    if (!isDrawableElement($el))
      throw new TypeError("Passed element is not a drawable!");

    const ctx = this._ctx;
    // if isOverlay is true, do not clear current canvas
    if (!isOverlay) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage($el, 0, 0, ctx.canvas.width, ctx.canvas.height);

    this._saveHistory();
  }

  async fillImageByDataURL(src, { isOverlay = false } = {}) {
    if (!isBase64DataURL(src))
      throw new TypeError("Passed src is not a base64 data URL!");

    const img = await loadImage(src);

    const ctx = this._ctx;
    // if isOverlay is true, do not clear current canvas
    if (!isOverlay) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);

    this._saveHistory();
  }

  async undo() {
    this._history.undo();
    const base64 = this._history.value;
    if (!isBase64DataURL(base64)) return;

    const img = await loadImage(base64);

    const ctx = this._ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  async redo() {
    this._history.redo();
    const base64 = this._history.value;
    if (!isBase64DataURL(base64)) return;

    const img = await loadImage(base64);

    const ctx = this._ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  destroy() {
    this._unbindEvents();

    this._ev.removeAllListeners();
    this._history.clear();

    cancelAnimationFrame(this._timer);
    this._timer = null;
  }

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

    const currentMid = getMidInputCoords(
      this._coords.old,
      this._coords.current
    );
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
    this._isDrawing = true;

    const coords = getInputCoords(ev, this._$el);
    this._coords.current = this._coords.old = coords;
    this._coords.oldMid = getMidInputCoords(this._coords.old, coords);

    this._ev.trigger("drawBegin", this._coords.current);
  }

  _onInputMove(ev) {
    this._coords.current = getInputCoords(ev, this._$el);
  }

  _onInputUp() {
    this._ev.trigger("drawEnd", this._coords.current);
    this._saveHistory();

    this._isDrawing = false;
  }

  _onInputCancel() {
    if (this._isDrawing) {
      this._ev.trigger("drawEnd", this._coords.current);
      this._saveHistory();
    }

    this._isDrawing = false;
  }

  _saveHistory() {
    this._history.save(this.toDataURL());
    this._ev.trigger("save", this._history.value);
  }
}
