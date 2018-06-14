var Eve = require('./eve');
var Stack = require('./stack');

var Util = {
    // 便利メソッドたち
    isTouch:         isTouch,
    isTransparent:   isTransparent,
    isDrawableEl:    isDrawableEl,
    getAdjustedRect: getAdjustedRect,
    getScale:        getScale,

    // shim
    rAF: (rAF()),
    cAF: (cAF()),

    // EA
    Eve: Eve,

    // Stack
    Stack: Stack,
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
      left: elRect.left + global.pageXOffset,
      top:  elRect.top  + global.pageYOffset,
    };
}

/**
 * 要素の実際のwidth/heightと、style上のwidth/heightの比を返す
 * canvasのstyleを指定すると座標がずれるため
 *
 * @param {HTMLElement} el
 *     チェックする要素
 * @return {Object}
 *     x軸 / y軸の比
 *
 */
function getScale(el) {
    var elRect = el.getBoundingClientRect();
    return {
      x: el.width / elRect.width,
      y: el.height / elRect.height,
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

module.exports = Util;
