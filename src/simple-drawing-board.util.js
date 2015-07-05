;(function(global, undefined) {
'use strict';

if (!global.SimpleDrawingBoard) {
    throw new Error('SimpleDrawingBoard is not defined in window.');
}

global.SimpleDrawingBoard.util = {
    isTransparent: isTransparent,
    rAF: (rAF()),
    cAF: (cAF()),
    Eve: Eve,
    Const: {
        settings: {
            lineColor:    '#aaa',
            lineSize:     5,
            boardColor:   'transparent',
            historyDepth: 10
        }
    }
};

/**
 * 透過の背景の場合、消すモードの処理が微妙に変わるので、
 * それをチェックしたい
 *
 * @param {String} color
 *     色
 */
function isTransparent(color) {
    color = color.replace(/\s/g, '');
    if (color === 'transparent')   { return true; }
    // TODO: strict
    if (color === 'rgba(0,0,0,0)') { return true; }
    return false;
}

/**
 * requestAnimationFrameのshim
 *
 */
function rAF() {
    return (global.requestAnimationFrame       ||
            global.webkitRequestAnimationFrame ||
            global.mozRequestAnimationFrame    ||
            function(callback) {
                global.setTimeout(callback, 1000 / 60);
            }).bind(global);
}

/**
 * cancelAnimationFrameのshim
 *
 */
function cAF() {
    return (global.cancelAnimationFrame       ||
            global.webkitCancelAnimationFrame ||
            global.mozCancelAnimationFrame    ||
            function(callback) {
                global.clearTimeout(callback);
            }).bind(global);
}

/**
 * Minimal event interface
 * See `https://gist.github.com/leader22/3ab8416ce41883ae1ccd`
 *
 */
function Eve() {
    this._events = {};
};
Eve.prototype = {
    constructor: Eve,
    on: function(evName, handler) {
        var events = this._events;

        if (!(evName in events)) {
            events[evName] = [];
        }
        events[evName].push(handler);
    },
    off: function(evName, handler) {
        var events = this._events;

        if (!(evName in events)) {
            return;
        }
        if (!handler) {
            events[evName] = [];
        }

        var handlerIdx = events[evName].indexOf(handler);
        if (handlerIdx >= 0) {
            events[evName].splice(handlerIdx, 1);
        }
    },
    trigger: function(evName, evData) {
        var events = this._events,
            handler;

        if (!(evName in events)) { return; }

        var i = 0, l = events[evName].length;
        for (; i < l; i++) {
            handler = events[evName][i];
            handler.handleEvent ? handler.handleEvent.call(this, evData)
                                : handler.call(this, evData);
        }
    }
};

}(window));
