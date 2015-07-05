/**
 * TODO:
 * - 色のバリデーション
 * - 透明で消す
 * - 履歴まわり
 *
 * - コメント
 *
 */
;(function(global, undefined) {
'use strict';

function SimpleDrawingBoard(el, options) {
    this._ensureEl(el);

    this.ev  = new SimpleDrawingBoard.util.Eve();
    this.el  = el;
    this.ctx = el.getContext('2d');

    this._elRect    = el.getBoundingClientRect();
    this._isDrawing = 0;
    this._coords    = {
        old:     { x:0, y:0 },
        oldMid:  { x:0, y:0 },
        current: { x:0, y:0 }
    };
    this._settings  = {};
    this._history   = [];

    this._initBoard(options);
};

SimpleDrawingBoard.prototype = {
    // Draw
    setLineSize:  setLineSize,
    setLineColor: setLineColor,
    fill:         fill,
    clear:        clear,
    setMode:      setMode,

    // Util
    getImg: getImg,
    undo:   undo,
    redo:   redo,

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
    _getMidInputCoords: _getMidInputCoords
};

function setLineSize(size) {
    this.ctx.lineWidth = (size|0) || 1;
    return this;
}
function setLineColor(color) {
    // TODO: validation
    this.ctx.strokeStyle = color;
    return this;
}
function fill(color) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    // TODO: validation
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    return this;
}
function clear() {
    this.fill(this._settings.boardColor);
    return this;
}
function setMode(mode) {
    var settings = this._settings;

    if (mode === 'DRAW') {
        this.setLineColor(settings.lineColor);
        // TODO: transparentな時はコレにしないとダメ？
        // this.ctx.globalCompositeOperation = 'source-over';
    }
    else {
        this.setLineColor(settings.boardColor);
        // TODO: transparentな時はコレにしないとダメ？
        // this.ctx.globalCompositeOperation = 'destination-out';
    }
    this._settings.mode = mode;
    return this;
}
function getImg() {
    return this.ctx.canvas.toDataURL('image/png');
}
function undo() {}
function redo() {}


function _ensureEl(el) {
    if ((!el) ||
       (typeof el !== 'object') ||
       (el.tagName.toLowerCase() !== 'canvas')) {
        throw new Error('Pass canvas element as first argument.');
    }
}

function _initBoard(options) {
    var settings = this._settings = SimpleDrawingBoard.util.Const.settings;
    if (options) {
        for (var p in options) {
            settings[p] = options[p];
        }
    }

    this.ctx.lineCap = this.ctx.lineJoin = 'round';
    this.setMode('DRAW');
    this.setLineSize(settings.lineSize);
    this.setLineColor(settings.lineColor);

    this.clear();
    this._initEvents();
    console.log(settings);
}

function _initEvents() {
    var that = this;

    this.el.addEventListener('mousedown', this, false);
    this.el.addEventListener('mousemove', this, false);
    this.el.addEventListener('mouseup',   this, false);
    this.el.addEventListener('mouseout',  this, false);

    this._draw();
    setInterval(function() { that._draw(); }, 16);
}

function _draw() {
    var currentMid = this._getMidInputCoords(this._coords.current);
    this.ctx.beginPath();
    this.ctx.moveTo(currentMid.x, currentMid.y);
    this.ctx.quadraticCurveTo(this._coords.old.x, this._coords.old.y, this._coords.oldMid.x, this._coords.oldMid.y);

    this._isDrawing && this.ctx.stroke();

    this._coords.old    = this._coords.current;
    this._coords.oldMid = currentMid;
}

function _onInputDown() {
    this._isDrawing = 1;
}
function _onInputMove(ev) {
    var coords = this._getInputCoords(ev);
    this._coords.current = coords;
}
function _onInputUp() {
    this._isDrawing = 0;
}

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

function _getMidInputCoords(coords) {
    return {
        x: this._coords.old.x + coords.x>>1,
        y: this._coords.old.y + coords.y>>1
    };
}

// TODO: AMD/commonJS
global.SimpleDrawingBoard = SimpleDrawingBoard;

}(window));
