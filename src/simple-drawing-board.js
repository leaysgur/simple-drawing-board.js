/**
 * TODO:
 * - モバイル
 * - エクスポートまわり
 * - destroy
 * - utilのコメント
 *
 */
;(function(global, undefined) {
'use strict';

function SimpleDrawingBoard(el, options) {
    // canvasの存在チェック
    this._ensureEl(el);

    this.ev  = new SimpleDrawingBoard.util.Eve();
    this.el  = el;
    this.ctx = el.getContext('2d');

    // 座標補正のため
    this._elRect    = el.getBoundingClientRect();
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
    this._history   = {
        values:   null,
        position: null
    };

    this._initHistory();
    this._initBoard(options);
};


SimpleDrawingBoard.prototype = {
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
    _ensureEl:          _ensureEl,
    _initBoard:         _initBoard,
    _initEvents:        _initEvents,
    _onInputDown:       _onInputDown,
    _onInputMove:       _onInputMove,
    _onInputUp:         _onInputUp,
    _draw:              _draw,
    _getInputCoords:    _getInputCoords,
    _getMidInputCoords: _getMidInputCoords,
    _initHistory:       _initHistory,
    _saveHistory:       _saveHistory,
    _goThroughHistory:  _goThroughHistory
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
    this.fill(this._settings.boardColor);
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
 * 現在のボードをbase64文字列で復元
 *
 * @param {String} src
 *     base64文字列
 *
 */
function setImg(src) {
    var ctx = this.ctx;
    var img = new Image();
    img.onload = function() {
        var oldGCO = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(img, 0, 0);
        ctx.globalCompositeOperation = oldGCO;
    };
    img.src = src;
}
/**
 * 履歴を戻す
 *
 */
function undo() {
    this._goThroughHistory(false);
}
/**
 * 履歴を進める
 *
 */
function redo() {
    this._goThroughHistory(true);
}
/**
 * 後始末
 *
 */
function dispose() {
    this.el.removeEventListener('mousedown', this, false);
    this.el.removeEventListener('mousemove', this, false);
    this.el.removeEventListener('mouseup',   this, false);
    this.el.removeEventListener('mouseout',  this, false);

    SimpleDrawingBoard.util.cAF(this._timer);
    this._timer = null;

    this._initHistory();
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
 *     `SimpleDrawingBoard.util.Const.settings`参照
 *
 */
function _initBoard(options) {
    var settings = this._settings = SimpleDrawingBoard.util.Const.settings;
    if (options) {
        for (var p in options) {
            settings[p] = options[p];
        }
    }

    // 透過な時は消すモードで一手間必要になる
    if (SimpleDrawingBoard.util.isTransparent(settings.boardColor)) {
        settings.boardColor    = 'rgba(0,0,0,1)';
        settings.isTransparent = 1;
    }

    // 初期は書くモード
    settings.isDrawMode = 1;

    this.ctx.lineCap = this.ctx.lineJoin = 'round';
    this.setLineSize(settings.lineSize);
    this.setLineColor(settings.lineColor);
    this.clear();
    this._saveHistory();

    this._initEvents();
    this._draw();
    console.log('Board settings ->', settings);
}
/**
 * 基本的なイベントを貼る
 *
 */
function _initEvents() {
    this.el.addEventListener('mousedown', this, false);
    this.el.addEventListener('mousemove', this, false);
    this.el.addEventListener('mouseup',   this, false);
    this.el.addEventListener('mouseout',  this, false);
}
/**
 * 実際の描画処理
 * 別のイベントで集めた座標情報を元に、描画するだけ
 *
 */
function _draw() {
    var currentMid = this._getMidInputCoords(this._coords.current);

    this.ctx.beginPath();
    this.ctx.moveTo(currentMid.x, currentMid.y);
    this.ctx.quadraticCurveTo(this._coords.old.x, this._coords.old.y, this._coords.oldMid.x, this._coords.oldMid.y);

    this._isDrawing && this.ctx.stroke();

    this._coords.old    = this._coords.current;
    this._coords.oldMid = currentMid;

    this._timer = SimpleDrawingBoard.util.rAF(this._draw.bind(this));
}
/**
 * 描画しはじめの処理
 *
 */
function _onInputDown() {
    this._isDrawing = 1;
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
    this._saveHistory();
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
        this._onInputDown();
        break;
    case 'mousemove':
        this._onInputMove(ev);
        break;
    case 'mouseup':
    case 'mouseout':
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
    if (ev.touches && ev.touches.length === 1) {
        x = ev.touches[0].pageX;
        y = ev.touches[0].pageY;
    } else {
        x = ev.pageX;
        y = ev.pageY;
    }
    return {
        x: x - this._elRect.left,
        y: y - this._elRect.top
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
 * 履歴のオブジェクトを初期化
 *
 */
function _initHistory() {
    this._history = {
        values:   [],
        position: 0
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
    var lastImg = history.values[history.values.length-1];
    if (lastImg && curImg === lastImg) { return; }

    // TODO: from options
    // 履歴には限度がある
    while (history.values.length >= this._settings.historyDepth) {
        history.values.shift();
        history.position--;
    }

    if (history.position !== 0 && history.position < history.values.length) {
        history.values = history.values.slice(0, history.position);
        history.position++;
    } else {
        history.position = history.values.length + 1;
    }
    history.values.push(curImg);

    console.log('History saved ->', history);
}
/**
 * 履歴から復元する
 *
 * @param {Boolean} goForth
 *     戻す or やり直すで、やり直すならtrue
 *
 */
function _goThroughHistory(goForth) {
    var history = this._history;
    if ((goForth && history.position === history.values.length) ||
            (!goForth && history.position === 1)) {
        return;
    }

    var pos = goForth ? history.position + 1 : history.position - 1;
    if (history.values.length && history.values[pos-1] !== undefined) {
        history.position = pos;
        this.setImg(history.values[pos-1]);
    }
}


global.SimpleDrawingBoard = SimpleDrawingBoard;

}(window));
