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
