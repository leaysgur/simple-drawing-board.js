import Eve from "./eve";
import Stack from "./stack";

const Util = {
  // 便利メソッドたち
  isTouch: isTouch,
  isTransparent: isTransparent,
  isDrawableEl: isDrawableEl,
  getAdjustedRect: getAdjustedRect,
  getScale: getScale,

  // EA
  Eve: Eve,

  // Stack
  Stack: Stack
};

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
  const elRect = el.getBoundingClientRect();
  return {
    left: elRect.left + window.pageXOffset,
    top: elRect.top + window.pageYOffset
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
  const elRect = el.getBoundingClientRect();
  return {
    x: el.width / elRect.width,
    y: el.height / elRect.height
  };
}

export default Util;
