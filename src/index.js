import { SimpleDrawingBoard } from "./sdb";

export function create($el, options = {}) {
  if (!($el instanceof HTMLCanvasElement))
    throw new TypeError("HTMLCanvasElement must be passed as first argument!");

  // TODO: validate
  const historyDepth = options.historyDepth || 10;

  const sdb = new SimpleDrawingBoard($el, {
    historyDepth,
  });

  return sdb;
}
