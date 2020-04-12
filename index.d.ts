declare class Eve {
  on(ev: string, fn: Function): void;
  off(ev: string, fn?: Function): void;
  trigger(ev: string, payload: any): void;
}

declare class SimpleDrawingBoard {
  get observer(): Eve;
  get canvas(): HTMLCanvasElement;
  get mode(): "draw" | "erase"
  setLineSize(size: number): void;
  setLineColor(color: string): void;
  fill(color: string): void;
  clear(): void;
  toggleMode(): void;
  toDataURL(): string;
  fillImageByElement($el: CanvasImageSource): void;
  fillImageByDataURL(src: string): Promise<void>;
  undo(): Promise<void>;
  redo(): Promise<void>;
  destroy(): void;
}

export declare function create($canvas: HTMLCanvasElement): SimpleDrawingBoard;
