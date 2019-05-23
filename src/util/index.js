/**
 * touchデバイス or NOT
 *
 * @return {Boolean}
 *     isTouchデバイス
 */
export function isTouch() {
  return "ontouchstart" in window.document;
}

/**
 * 透過の背景の場合、消すモードの処理が微妙に変わるので、
 * それをチェックしたい
 *
 * @param {String} color
 *     色
 */
export function isTransparent(color) {
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
export function isDrawableEl(el) {
  const isDrawable =
    ["img", "canvas", "video"].indexOf(el.tagName.toLowerCase()) !== -1;

  return isDrawable;
}
