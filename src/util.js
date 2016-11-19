var Util = {
    // 便利メソッドたち
    isTouch:         (isTouch()),
    isTransparent:   isTransparent,
    isDrawableEl:    isDrawableEl,
    getAdjustedRect: getAdjustedRect,

    // shim
    rAF: (rAF()),
    cAF: (cAF()),

    // EA
    Eve: Eve,
};

/**
 * touchデバイス or NOT
 *
 * @return {Boolean}
 *     isTouchデバイス
 */
function isTouch() {
    return 'ontouchstart' in global.document;
}

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

    var isRgbaOrHlsaTransparent = color.split(',')[3] === '0)';
    if (isRgbaOrHlsaTransparent) { return true; }

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
    var isDrawable = [
        'img',
        'canvas',
        'video'
    ].indexOf(el.tagName.toLowerCase()) !== -1;

    return isDrawable;
}

/**
 * スクロールされた状態でリロードすると、位置ズレするっぽいので、
 * スクロール位置も加味してgetBoundingClientRectする
 *
 * @param {HTMLElement} el
 *     チェックする要素
 * @return {Object}
 *     left / topの位置
 *
 */
function getAdjustedRect(el) {
    var elRect = el.getBoundingClientRect();
    return {
      left: elRect.left + global.scrollX,
      top:  elRect.top  + global.scrollY
    };
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
}
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

module.exports = Util;
