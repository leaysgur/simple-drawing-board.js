(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.SimpleDrawingBoard = factory());
}(this, function () { 'use strict';

  /**
   * touchデバイス or NOT
   *
   * @return {Boolean}
   *     isTouchデバイス
   */
  function isTouch() {
    return "ontouchstart" in window.document;
  }

  /**
   * 透過の背景の場合、消すモードの処理が微妙に変わるので、
   * それをチェックしたい
   *
   * @param {String} color
   *     色
   */
  function isTransparent(color) {
    color = color.replace(/\s/g, "");
    if (color === "transparent") {
      return true;
    }

    const isRgbaOrHlsaTransparent = color.split(",")[3] === "0)";
    if (isRgbaOrHlsaTransparent) {
      return true;
    }

    return false;
  }

  /**
   * ctx.drawImageできるのは3つ
   *
   * @param {HTMLElement} el
   *     チェックする要素
   * @return {Boolean}
   *     描画できる要素かどうか
   *
   */
  function isDrawableEl(el) {
    const isDrawable =
      ["img", "canvas", "video"].indexOf(el.tagName.toLowerCase()) !== -1;

    return isDrawable;
  }

  /**
   * Minimal event interface
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
  }

  /**
   * Stack Data Structure
   */
  class Stack {
    constructor() {
      this._items = [];
    }

    get(i) {
      return this._items[i];
    }

    push(item) {
      this._items.push(item);
    }

    pop() {
      if (this._items.length > 0) {
        return this._items.pop();
      }
      return null;
    }

    shift() {
      if (this._items.length > 0) {
        return this._items.shift();
      }
      return null;
    }

    clear() {
      this._items.length = 0;
    }

    size() {
      return this._items.length;
    }
  }

  class SimpleDrawingBoard {
    constructor(el, options) {
      if (!(el instanceof HTMLCanvasElement)) {
        throw new Error("Pass canvas element as first argument.");
      }

      this.ev = new Eve();
      this.el = el;
      this.ctx = el.getContext("2d");

      // trueの時だけstrokeされる
      this._isDrawing = 0;
      // 描画用のタイマー
      this._timer = null;
      // 座標情報
      this._coords = {
        old: { x: 0, y: 0 },
        oldMid: { x: 0, y: 0 },
        current: { x: 0, y: 0 }
      };
      this._settings = {
        lineColor: "#aaa",
        lineSize: 5,
        boardColor: "transparent",
        historyDepth: 10,
        isTransparent: 1,
        isDrawMode: 1
      };
      // 描画履歴
      this._history = {
        // undo
        prev: new Stack(),
        // redo
        next: new Stack()
      };

      this._initBoard(options);
    }

    /**
     * 線の太さを設定する
     *
     * @param {Number} size
     *     太さ(1以下は全て1とする)
     *
     */
    setLineSize(size) {
      this.ctx.lineWidth = size | 0 || 1;
      return this;
    }

    /**
     * 線の色を設定する
     *
     * @param {String} color
     *     色
     *
     */
    setLineColor(color) {
      this.ctx.strokeStyle = color;
      return this;
    }

    /**
     * 単一の色で塗りつぶす
     *
     * @param {String} color
     *     色
     *
     */
    fill(color) {
      this._saveHistory();
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      return this;
    }

    /**
     * ボードをクリアする
     * 実際は、背景色で塗りつぶす
     *
     */
    clear() {
      const settings = this._settings;
      this._saveHistory();
      // 透明なときは一手間
      if (settings.isTransparent) {
        const oldGCO = this.ctx.globalCompositeOperation;
        this.ctx.globalCompositeOperation = "destination-out";
        this.fill(this._settings.boardColor);
        this.ctx.globalCompositeOperation = oldGCO;
      }
      // 違うならそのまま
      else {
        this.fill(this._settings.boardColor);
      }

      return this;
    }

    /**
     * 書くモードと消すモードをスイッチ
     *
     */
    toggleMode() {
      const settings = this._settings;
      // 消す
      if (settings.isDrawMode) {
        this.setLineColor(settings.boardColor);
        if (settings.isTransparent) {
          this.ctx.globalCompositeOperation = "destination-out";
        }
        settings.isDrawMode = 0;
      }
      // 書く
      else {
        this.setLineColor(settings.lineColor);
        if (settings.isTransparent) {
          this.ctx.globalCompositeOperation = "source-over";
        }
        settings.isDrawMode = 1;
      }

      this.ev.trigger("toggleMode", settings.isDrawMode);
      return this;
    }

    /**
     * 現在のボードをbase64文字列で取得
     *
     * @return {String}
     *     base64文字列
     *
     */
    getImg() {
      return this.ctx.canvas.toDataURL("image/png");
    }

    /**
     * 現在のボードをなんかしら復元
     *
     * @param {String|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} src
     *     画像URLか、drawImageできる要素
     * @param {Boolean} isOverlay
     *     上に重ねるならtrue
     * @param {Boolean} isSkipSaveHistory
     *     履歴保存をスキップするならtrue（デフォルトfalse）
     *
     */
    setImg(src, isOverlay, isSkipSaveHistory) {
      isOverlay = isOverlay || false;
      isSkipSaveHistory = isSkipSaveHistory || false;
      if (!isSkipSaveHistory) {
        this._saveHistory();
      }

      // imgUrl
      if (typeof src === "string") {
        this._setImgByImgSrc(src, isOverlay);
      }
      // img, video, canvas element
      else {
        this._setImgByDrawableEl(src, isOverlay);
      }

      return this;
    }

    /**
     * 履歴を戻す
     *
     */
    undo() {
      this._restoreFromHistory(false);
    }

    /**
     * 履歴を進める
     *
     */
    redo() {
      this._restoreFromHistory(true);
    }

    /**
     * 後始末
     *
     */
    dispose() {
      this._unbindEvents();

      cancelAnimationFrame(this._timer);
      this._timer = null;

      this._history.prev.clear();
      this._history.next.clear();

      this.ev.trigger("dispose");
    }

    /**
     * ボードを初期化する
     *
     * @param {Object} options
     *     初期化オプション
     *     `Const.settings`参照
     *
     */
    _initBoard(options) {
      const settings = this._settings;

      if (options) {
        for (const p in options) {
          settings[p] = options[p];
        }
      }

      // 透過な時は消すモードで一手間必要になる
      if (isTransparent(settings.boardColor)) {
        settings.boardColor = "rgba(0,0,0,1)";
        settings.isTransparent = 1;
      }

      // 初期は書くモード
      settings.isDrawMode = 1;

      this.ctx.lineCap = this.ctx.lineJoin = "round";
      this.setLineSize(settings.lineSize);
      this.setLineColor(settings.lineColor);

      this._bindEvents();
      this._draw();
    }

    _bindEvents() {
      const events = isTouch()
        ? ["touchstart", "touchmove", "touchend", "touchcancel", "gesturestart"]
        : ["mousedown", "mousemove", "mouseup", "mouseout"];

      for (let i = 0, l = events.length; i < l; i++) {
        this.el.addEventListener(events[i], this, false);
      }
    }

    _unbindEvents() {
      const events = isTouch()
        ? ["touchstart", "touchmove", "touchend", "touchcancel", "gesturestart"]
        : ["mousedown", "mousemove", "mouseup", "mouseout"];

      for (let i = 0, l = events.length; i < l; i++) {
        this.el.removeEventListener(events[i], this, false);
      }
    }

    /**
     * 実際の描画処理
     * 別のイベントで集めた座標情報を元に、描画するだけ
     *
     */
    _draw() {
      // さっきと同じ場所なら書かなくていい
      const isSameCoords =
        this._coords.old.x === this._coords.current.x &&
        this._coords.old.y === this._coords.current.y;

      if (this._isDrawing && !isSameCoords) {
        const currentMid = this._getMidInputCoords(this._coords.current);
        this.ctx.beginPath();
        this.ctx.moveTo(currentMid.x, currentMid.y);
        this.ctx.quadraticCurveTo(
          this._coords.old.x,
          this._coords.old.y,
          this._coords.oldMid.x,
          this._coords.oldMid.y
        );
        this.ctx.stroke();

        this._coords.old = this._coords.current;
        this._coords.oldMid = currentMid;

        this.ev.trigger("draw", this._coords.current);
      }

      this._timer = requestAnimationFrame(this._draw.bind(this));
    }

    /**
     * 描画しはじめの処理
     *
     */
    _onInputDown(ev) {
      this._saveHistory();
      this._isDrawing = 1;

      const coords = this._getInputCoords(ev);
      this._coords.current = this._coords.old = coords;
      this._coords.oldMid = this._getMidInputCoords(coords);
    }

    /**
     * 描画してる間の処理
     *
     */
    _onInputMove(ev) {
      this._coords.current = this._getInputCoords(ev);
    }

    /**
     * 描画しおわりの処理
     *
     */
    _onInputUp() {
      this._isDrawing = 0;
    }

    /**
     * いわゆるhandleEvent
     *
     * @param {Object} ev
     *     イベント
     *
     */
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
        case "mouseout":
        case "touchend":
        case "touchcancel":
        case "gesturestart":
          this._onInputUp();
          break;
        default:
      }
    }

    /**
     * 座標の取得
     *
     * @param {Object} ev
     *     イベント
     * @return {Object}
     *     x, y座標
     *
     */
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
      const elBCRect = this.el.getBoundingClientRect();

      // スクロールされた状態でリロードすると、位置ズレするので加味する
      const elRect = {
        left: elBCRect.left + window.pageXOffset,
        top: elBCRect.top + window.pageYOffset
      };
      // canvasのstyle指定に対応する
      const elScale = {
        x: this.el.width / elBCRect.width,
        y: this.el.height / elBCRect.height
      };

      return {
        x: (x - elRect.left) * elScale.x,
        y: (y - elRect.top) * elScale.y
      };
    }

    /**
     * 座標の取得
     *
     * @param {Object} coords
     *     元のx, y座標
     * @return {Object}
     *     変換されたx, y座標
     *
     */
    _getMidInputCoords(coords) {
      return {
        x: (this._coords.old.x + coords.x) >> 1,
        y: (this._coords.old.y + coords.y) >> 1
      };
    }

    /**
     * 現在のボードを画像URLから復元
     *
     * @param {String} src
     *     画像URL
     * @param {Boolean} isOverlay
     *     現在のボードを消さずに復元するならtrue
     *
     */
    _setImgByImgSrc(src, isOverlay) {
      const ctx = this.ctx;
      const oldGCO = ctx.globalCompositeOperation;
      const img = new Image();

      img.onload = function() {
        ctx.globalCompositeOperation = "source-over";
        isOverlay || ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.globalCompositeOperation = oldGCO;
      };

      img.src = src;
    }

    /**
     * 現在のボードを特定の要素から復元
     *
     * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} el
     *     drawImageできる要素
     * @param {Boolean} isOverlay
     *     現在のボードを消さずに復元するならtrue
     *
     */
    _setImgByDrawableEl(el, isOverlay) {
      if (!isDrawableEl(el)) {
        return;
      }

      const ctx = this.ctx;
      const oldGCO = ctx.globalCompositeOperation;

      ctx.globalCompositeOperation = "source-over";
      isOverlay || ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(el, 0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.globalCompositeOperation = oldGCO;
    }

    /**
     * 履歴に現在のボードを保存する
     *
     */
    _saveHistory() {
      const history = this._history;

      // 最後の履歴と同じ結果なら保存しない
      const curImg = this.getImg();
      const lastImg = history.prev.get(history.prev.size() - 1);
      if (lastImg && curImg === lastImg) {
        return;
      }

      // 履歴には限度がある
      while (history.prev.size() >= this._settings.historyDepth) {
        // 古い履歴から消していく
        history.prev.shift();
      }

      // 普通にセーブ
      history.prev.push(curImg);
      // redo用履歴はクリアする
      history.next.clear();

      this.ev.trigger("save", curImg);
    }

    /**
     * 履歴から復元する
     *
     * @param {Boolean} goForth
     *     戻す or やり直すで、やり直すならtrue
     *
     */
    _restoreFromHistory(goForth) {
      const history = this._history;
      let pushKey = "next";
      let popKey = "prev";
      if (goForth) {
        // redoのときはnextからpopし、prevにpushする
        pushKey = "prev";
        popKey = "next";
      }
      const item = history[popKey].pop();
      if (item == null) {
        return;
      }

      // 最後の履歴と同じ結果なら保存しない
      const curImg = this.getImg();
      const lastImg = history.next.get(history.next.size() - 1);
      if (!lastImg || lastImg != curImg) {
        history[pushKey].push(curImg);
      }

      // この操作は履歴を保存しない
      this.setImg(item, false, true);
    }
  }

  return SimpleDrawingBoard;

}));
