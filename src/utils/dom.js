export function isTouch() {
  return "ontouchstart" in window.document;
}

// expect HTML elements from CanvasImageSource
export function isDrawableElement($el) {
  if ($el instanceof HTMLImageElement) return true;
  if ($el instanceof SVGImageElement) return true;
  if ($el instanceof HTMLCanvasElement) return true;
  if ($el instanceof HTMLVideoElement) return true;
  return false;
}

export function isBase64DataURL(url) {
  if (typeof url !== "string") return false;
  if (!url.startsWith("data:image/")) return false;
  return true;
}

export async function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = reject;
    img.onload = () => resolve(img);
    img.src = src;
  });
}

export function getMidInputCoords(old, coords) {
  return {
    x: (old.x + coords.x) >> 1,
    y: (old.y + coords.y) >> 1,
  };
}

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
