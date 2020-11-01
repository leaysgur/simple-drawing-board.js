(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.SimpleDrawingBoard = {}));
}(this, (function (exports) { 'use strict';

  /**
   *
   * Minimul EventEmitter implementation
   * See `https://gist.github.com/leader22/3ab8416ce41883ae1ccd`
   *
   */
  class Eve {
    constructor() {
      this._events = {};
    }

    on(evName, handler) {
      const events = this._events;

      if (!(evName in events)) {
        events[evName] = [];
      }
      events[evName].push(handler);
    }

    off(evName, handler) {
      const events = this._events;

      if (!(evName in events)) {
        return;
      }
      if (!handler) {
        events[evName] = [];
      }

      const handlerIdx = events[evName].indexOf(handler);
      if (handlerIdx >= 0) {
        events[evName].splice(handlerIdx, 1);
      }
    }

    trigger(evName, evData) {
      const events = this._events;

      if (!(evName in events)) {
        return;
      }

      for (let i = 0; i < events[evName].length; i++) {
        const handler = events[evName][i];
        handler.handleEvent
          ? handler.handleEvent.call(this, evData)
          : handler.call(this, evData);
      }
    }

    removeAllListeners() {
      this._events = {};
    }
  }

  /**
   *
   * History for undo/redo Structure(mutable)
   * See `https://gist.github.com/leader22/9fbed07106d652ef40fda702da4f39c4`
   *
   */
  class History {
    constructor(initialValue = null) {
      this._past = [];
      this._present = initialValue;
      this._future = [];
    }

    get value() {
      return this._present;
    }

    undo() {
      if (this._past.length === 0) return;

      const previous = this._past.pop();
      this._future.unshift(this._present);
      this._present = previous;
    }

    redo() {
      if (this._future.length === 0) return;

      const next = this._future.shift();
      this._past.push(this._present);
      this._present = next;
    }

    save(newPresent) {
      if (this._present === newPresent) return;

      this._past.push(this._present);
      this._future.length = 0;
      this._present = newPresent;
    }

    clear() {
      this._past.length = 0;
      this._future.length = 0;
    }
  }

  function isTouch() {
    return "ontouchstart" in window.document;
  }

  // expect HTML elements from CanvasImageSource
  function isDrawableElement($el) {
    if ($el instanceof HTMLImageElement) return true;
    if ($el instanceof SVGImageElement) return true;
    if ($el instanceof HTMLCanvasElement) return true;
    if ($el instanceof HTMLVideoElement) return true;
    return false;
  }

  function isBase64DataURL(url) {
    if (typeof url !== "string") return false;
    if (!url.startsWith("data:image/")) return false;
    return true;
  }

  async function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => resolve(img);
      img.src = src;
    });
  }

  function getMidInputCoords(old, coords) {
    return {
      x: (old.x + coords.x) >> 1,
      y: (old.y + coords.y) >> 1,
    };
  }

  function getInputCoords(ev, $el) {
    let x, y;
    if (isTouch()) {
      x = ev.touches[0].pageX;
      y = ev.touches[0].pageY;
    } else {
      x = ev.pageX;
      y = ev.pageY;
    }

    // check this every time for real-time resizing
    const elBCRect = $el.getBoundingClientRect();

    // need to consider scrolled positions
    const elRect = {
      left: elBCRect.left + window.pageXOffset,
      top: elBCRect.top + window.pageYOffset,
    };

    // if canvas has styled
    const elScale = {
      x: $el.width / elBCRect.width,
      y: $el.height / elBCRect.height,
    };

    return {
      x: (x - elRect.left) * elScale.x,
      y: (y - elRect.top) * elScale.y,
    };
  }

  class SimpleDrawingBoard {
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

  function create($el) {
    if (!($el instanceof HTMLCanvasElement))
      throw new TypeError("HTMLCanvasElement must be passed as first argument!");

    const sdb = new SimpleDrawingBoard($el);
    return sdb;
  }

  exports.create = create;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
