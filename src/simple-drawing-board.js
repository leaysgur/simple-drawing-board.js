'use strict';
var Util = require('./util');
var Const = require('./const');

function SimpleDrawingBoard(el, options) {
    // canvasの存在チェック
    this._ensureEl(el);

    this.ev  = new Util.Eve();
    this.el  = el;
    this.ctx = el.getContext('2d');

    // 座標補正のため
    this._elRect    = { left: 0, top: 0 };
    // trueの時だけstrokeされる
    this._isDrawing = 0;
    // 描画用のタイマー
    this._timer     = null;
    // 座標情報
    this._coords    = {
        old:     { x: 0, y: 0 },
        oldMid:  { x: 0, y: 0 },
        current: { x: 0, y: 0 }
    };
    this._settings  = {
        lineColor:     null,
        lineSize:      null,
        boardColor:    null,
        historyDepth:  null,
        isTransparent: null,
        isDrawMode:    null,
    };
    // 描画履歴
    this._history = {
        prev: new Util.Stack(), // undo用履歴
        next: new Util.Stack(), // redo用履歴
    };

    this._initHistory();
    this._initBoard(options);
}


SimpleDrawingBoard.prototype = {
    constructor:  SimpleDrawingBoard,

    // Draw
    setLineSize:  setLineSize,
    setLineColor: setLineColor,
    fill:         fill,
    clear:        clear,
    toggleMode:   toggleMode,

    // Util
    getImg:  getImg,
    setImg:  setImg,
    undo:    undo,
    redo:    redo,
    dispose: dispose,

    // XXX
    handleEvent: _handleEvent,

    // Private
    _ensureEl:           _ensureEl,
    _initBoard:          _initBoard,
    _bindEvents:         _bindEvents,
    _unbindEvents:       _unbindEvents,
    _bindOrUnbindEvents: _bindOrUnbindEvents,
    _onInputDown:        _onInputDown,
    _onInputMove:        _onInputMove,
    _onInputUp:          _onInputUp,
    _draw:               _draw,
    _getInputCoords:     _getInputCoords,
    _getMidInputCoords:  _getMidInputCoords,
    _setImgByImgSrc:     _setImgByImgSrc,
    _setImgByDrawableEl: _setImgByDrawableEl,
    _initHistory:        _initHistory,
    _saveHistory:        _saveHistory,
    _restoreFromHistory: _restoreFromHistory
};

/**
 * 線の太さを設定する
 *
 * @param {Number} size
 *     太さ(1以下は全て1とする)
 *
 */
function setLineSize(size) {
    this.ctx.lineWidth = (size|0) || 1;
    return this;
}
/**
 * 線の色を設定する
 *
 * @param {String} color
 *     色
 *
 */
function setLineColor(color) {
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
function fill(color) {
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
function clear() {
    var settings = this._settings;
    this._saveHistory();
    // 透明なときは一手間
    if (settings.isTransparent) {
        var oldGCO = this.ctx.globalCompositeOperation;
        this.ctx.globalCompositeOperation = 'destination-out';
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
function toggleMode() {
    var settings = this._settings;
    // 消す
    if (settings.isDrawMode) {
        this.setLineColor(settings.boardColor);
        if (settings.isTransparent) {
            this.ctx.globalCompositeOperation = 'destination-out';
        }
        settings.isDrawMode = 0;
    }
    // 書く
    else {
        this.setLineColor(settings.lineColor);
        if (settings.isTransparent) {
            this.ctx.globalCompositeOperation = 'source-over';
        }
        settings.isDrawMode = 1;
    }

    this.ev.trigger('toggleMode', settings.isDrawMode);
    return this;
}
/**
 * 現在のボードをbase64文字列で取得
 *
 * @return {String}
 *     base64文字列
 *
 */
function getImg() {
    return this.ctx.canvas.toDataURL('image/png');
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
function setImg(src, isOverlay, isSkipSaveHistory) {
    isOverlay = isOverlay || false;
    isSkipSaveHistory = isSkipSaveHistory || false;
    if (!isSkipSaveHistory) {
        this._saveHistory();
    }

    // imgUrl
    if (typeof src === 'string') {
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
function undo() {
    this._restoreFromHistory(false);
}
/**
 * 履歴を進める
 *
 */
function redo() {
    this._restoreFromHistory(true);
}
/**
 * 後始末
 *
 */
function dispose() {
    this._unbindEvents();

    Util.cAF(this._timer);
    this._timer = null;

    this._initHistory();

    this.ev.trigger('dispose');
}
/**
 * canvasの存在を確かめる
 *
 * @param {HTMLCanvasElement} el
 *     canvas要素
 *
 */
function _ensureEl(el) {
    if ((!el) ||
       (typeof el !== 'object') ||
       (el.tagName.toLowerCase() !== 'canvas')) {
        throw new Error('Pass canvas element as first argument.');
    }
}
/**
 * ボードを初期化する
 *
 * @param {Object} options
 *     初期化オプション
 *     `Const.settings`参照
 *
 */
function _initBoard(options) {
    var settings = this._settings = Const.settings;
    if (options) {
        for (var p in options) {
            settings[p] = options[p];
        }
    }

    // 透過な時は消すモードで一手間必要になる
    if (Util.isTransparent(settings.boardColor)) {
        settings.boardColor    = 'rgba(0,0,0,1)';
        settings.isTransparent = 1;
    }

    // 初期は書くモード
    settings.isDrawMode = 1;

    this.ctx.lineCap = this.ctx.lineJoin = 'round';
    this.setLineSize(settings.lineSize);
    this.setLineColor(settings.lineColor);

    this._bindEvents();
    this._draw();
}
/**
 * 基本的なイベントを貼る
 *
 */
function _bindEvents() {
  this._bindOrUnbindEvents(true);
}
/**
 * 基本的なイベントを剥がす
 *
 */
function _unbindEvents() {
  this._bindOrUnbindEvents(false);
}
/**
 * 基本的なイベントを貼る / 剥がす
 *
 * @param {Boolean} bind
 *     貼るならtrue
 */
function _bindOrUnbindEvents(bind) {
    var events = (Util.isTouch()) ?
        ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'gesturestart'] :
        ['mousedown', 'mousemove', 'mouseup', 'mouseout'];
    var method = bind ? 'addEventListener' : 'removeEventListener';

    for (var i = 0, l = events.length; i < l; i++) {
        this.el[method](events[i], this, false);
    }
}
/**
 * 実際の描画処理
 * 別のイベントで集めた座標情報を元に、描画するだけ
 *
 */
function _draw() {
    // さっきと同じ場所なら書かなくていい
    var isSameCoords = this._coords.old.x === this._coords.current.x &&
                       this._coords.old.y === this._coords.current.y;
    if (this._isDrawing && !isSameCoords) {
        var currentMid = this._getMidInputCoords(this._coords.current);
        this.ctx.beginPath();
        this.ctx.moveTo(currentMid.x, currentMid.y);
        this.ctx.quadraticCurveTo(this._coords.old.x, this._coords.old.y, this._coords.oldMid.x, this._coords.oldMid.y);
        this.ctx.stroke();

        this._coords.old    = this._coords.current;
        this._coords.oldMid = currentMid;

        this.ev.trigger('draw', this._coords.current);
    }

    this._timer = Util.rAF(this._draw.bind(this));
}
/**
 * 描画しはじめの処理
 *
 */
function _onInputDown(ev) {
    this._saveHistory();
    this._isDrawing = 1;

    var coords = this._getInputCoords(ev);
    this._coords.current = this._coords.old = coords;
    this._coords.oldMid  = this._getMidInputCoords(coords);
}
/**
 * 描画してる間の処理
 *
 */
function _onInputMove(ev) {
    this._coords.current = this._getInputCoords(ev);
}
/**
 * 描画しおわりの処理
 *
 */
function _onInputUp() {
    this._isDrawing = 0;
}
/**
 * いわゆるhandleEvent
 *
 * @param {Object} ev
 *     イベント
 *
 */
function _handleEvent(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    switch (ev.type) {
    case 'mousedown':
    case 'touchstart':
        this._onInputDown(ev);
        break;
    case 'mousemove':
    case 'touchmove':
        this._onInputMove(ev);
        break;
    case 'mouseup':
    case 'mouseout':
    case 'touchend':
    case 'touchcancel':
    case 'gesturestart':
        this._onInputUp();
        break;
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
function _getInputCoords(ev) {
    var x, y;
    if (Util.isTouch()) {
        x = ev.touches[0].pageX;
        y = ev.touches[0].pageY;
    } else {
        x = ev.pageX;
        y = ev.pageY;
    }

    // いつリサイズされてもよいようリアルタイムに
    this._elRect = Util.getAdjustedRect(this.el);

    // canvasのstyle指定に対応するため
    this._elScale = Util.getScale(this.el);

    return {
        x: (x - this._elRect.left) * this._elScale.x,
        y: (y - this._elRect.top) * this._elScale.y
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
function _getMidInputCoords(coords) {
    return {
        x: this._coords.old.x + coords.x>>1,
        y: this._coords.old.y + coords.y>>1
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
function _setImgByImgSrc(src, isOverlay) {
    var ctx    = this.ctx;
    var oldGCO = ctx.globalCompositeOperation;
    var img    = new Image();

    img.onload = function() {
        ctx.globalCompositeOperation = 'source-over';
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
function _setImgByDrawableEl(el, isOverlay) {
    if (!Util.isDrawableEl(el)) { return; }

    var ctx    = this.ctx;
    var oldGCO = ctx.globalCompositeOperation;

    ctx.globalCompositeOperation = 'source-over';
    isOverlay || ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(el, 0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalCompositeOperation = oldGCO;
}
/**
 * 履歴のオブジェクトを初期化
 *
 */
function _initHistory() {
    this._history = {
        prev: new Util.Stack(), // undo用履歴
        next: new Util.Stack(), // redo用履歴
    };
}
/**
 * 履歴に現在のボードを保存する
 *
 */
function _saveHistory() {
    var history = this._history;

    // 最後の履歴と同じ結果なら保存しない
    var curImg  = this.getImg();
    var lastImg = history.prev.get(history.prev.size() - 1);
    if (lastImg && curImg === lastImg) { return; }

    // 履歴には限度がある
    while (history.prev.size() >= this._settings.historyDepth) {
        // 古い履歴から消していく
        history.prev.shift();
    }

    // 普通にセーブ
    history.prev.push(curImg);
    // redo用履歴はクリアする
    history.next = new Util.Stack();

    this.ev.trigger('save', curImg);
}
/**
 * 履歴から復元する
 *
 * @param {Boolean} goForth
 *     戻す or やり直すで、やり直すならtrue
 *
 */
function _restoreFromHistory(goForth) {
    var history = this._history;
    var pushKey = 'next';
    var popKey = 'prev';
    if (goForth) {
        // redoのときはnextからpopし、prevにpushする
        pushKey = 'prev';
        popKey = 'next';
    }
    var item = history[popKey].pop();
    if (item == null) {
        return;
    }

    // 最後の履歴と同じ結果なら保存しない
    var curImg  = this.getImg();
    var lastImg = history.next.get(history.next.size() - 1);
    if (!lastImg || lastImg != curImg) {
        history[pushKey].push(curImg);
    }

    // この操作は履歴を保存しない
    this.setImg(item, false, true);
}

// Export
module.exports = SimpleDrawingBoard;
