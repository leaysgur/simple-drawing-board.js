export function isTouch() {
  return "ontouchstart" in window.document;
}

export function isTransparent(color) {
  // parse `rgba(1, 2, 3, 0)` => `rgba(1,2,3,0)`
  // parse `hsla( 1,2,3,0 )`  => `hsla(1,2,3,0)`
  color = color.replace(/\s/g, "");

  if (color === "transparent") return true;
  if (color.split(",")[3] === "0)") return true;
  return false;
}

// expect HTML elements from CanvasImageSource
export function isDrawableElement($el) {
  if ($el instanceof HTMLImageElement) return true;
  if ($el instanceof SVGImageElement) return true;
  if ($el instanceof HTMLCanvasElement) return true;
  if ($el instanceof HTMLVideoElement) return true;
  return false;
}
