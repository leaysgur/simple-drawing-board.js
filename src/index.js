import { SimpleDrawingBoard } from "./sdb";

export function create($el) {
  if (!($el instanceof HTMLCanvasElement))
    throw new TypeError("HTMLCanvasElement must be passed as first argument!");

  const sdb = new SimpleDrawingBoard($el);
  return sdb;
}
