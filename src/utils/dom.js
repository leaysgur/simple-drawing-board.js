export function isTouch() {
  return "ontouchstart" in window.document;
}

// expect HTML elements from CanvasImageSource
/**
 *
 * @param $el {HTMLCanvasElement}
 * @returns {boolean}
 */
export function isDrawableElement($el) {
  if ($el instanceof HTMLImageElement) return true;
  if ($el instanceof SVGImageElement) return true;
  if ($el instanceof HTMLCanvasElement) return true;
  if ($el instanceof HTMLVideoElement) return true;
  return false;
}

/**
 *
 * @param url {string}
 * @returns {boolean}
 */
export function isBase64DataURL(url) {
  if (typeof url !== "string") return false;
  if (!url.startsWith("data:image/")) return false;
  return true;
}

/**
 *
 * @param src {string}
 * @returns {Promise<HTMLImageElement>}
 */
export async function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = reject;
    img.onload = () => resolve(img);
    img.src = src;
  });
}

/**
 *
 * @param old {{x: number, y: number}}
 * @param coords {{x: number, y: number}}
 * @returns {{x: number, y: number}}
 */
export function getMidInputCoords(old, coords) {
  return {
    x: (old.x + coords.x) >> 1,
    y: (old.y + coords.y) >> 1,
  };
}

/**
 *
 * @param ev {Event}
 * @param $el {HTMLCanvasElement}
 * @returns {{x: number, y: number}}
 */
export function getInputCoords(ev, $el) {
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
