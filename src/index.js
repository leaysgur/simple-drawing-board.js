import { SimpleDrawingBoard } from "./sdb";

const defaultOptions = {
  lineColor: "#aaa",
  lineSize: 5,
  boardColor: "transparent",
  historyDepth: 10
};

export function create($el, options = defaultOptions) {
  if (!($el instanceof HTMLCanvasElement))
    throw new TypeError("HTMLCanvasElement must be passed as first argument!");

  return new SimpleDrawingBoard($el, options);
}
