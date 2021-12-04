import { Eve } from "./utils/eve";
import { History } from "./utils/history";
import {
  isTouch,
  isDrawableElement,
  isBase64DataURL,
  loadImage,
  getMidInputCoords,
  getInputCoords,
} from "./utils/dom";

const Mode = {
  DRAW: 'draw',
  ERASE: 'erase',
  FLOOD: 'flood'
}

export class SimpleDrawingBoard {
  constructor($el) {
    this._$el = $el;
    this._ctx = this._$el.getContext("2d");

    // handwriting fashion ;D
    this._ctx.lineCap = this._ctx.lineJoin = "round";

    // for canvas operation
    this._drawMode = Mode.DRAW;
    this._isFlooding = false;

    // for drawing
    this._isDrawing = false;
    this._timer = null;
    this._coords = {
      old: { x: 0, y: 0 },
      oldMid: { x: 0, y: 0 },
      current: { x: 0, y: 0 },
    };

    this._imageData = undefined;

    this._ev = new Eve();
    this._history = new History(this.toDataURL());

    this.fill("#ffffff")
    this._bindEvents();
    this._drawFrame();
  }

  get canvas() {
    return this._$el;
  }

  get observer() {
    return this._ev;
  }

  get mode() {
    return this._drawMode;
  }

  setLineSize(size) {
    this._ctx.lineWidth = size | 0 || 1;
  }

  setLineColor(color) {
    this._ctx.strokeStyle = color;
  }

  fill(color) {
    const ctx = this._ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this._saveHistory();
  }

  clear() {
    const ctx = this._ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this._saveHistory();
  }

  // DRAW / ERASE / FLOOD
  toggleMode(mode) {
    if(! (mode == "DRAW" || mode == "ERASE" || mode == "FLOOD")){
      console.log("Error: Invalid drawing mode");
      return;
    }

    switch(mode){
      case "DRAW":
        this._ctx.globalCompositeOperation = "source-over";
        this._drawMode = Mode.DRAW;  
      break;
      case "ERASE":
        this._ctx.globalCompositeOperation = "destination-out";
        this._drawMode = Mode.ERASE;  
        break;
      case "FLOOD":
        this._ctx.globalCompositeOperation = "source-over";
        this._drawMode = Mode.FLOOD;  
        break;
    }    
  }

  toDataURL({ type, quality } = {}) {
    return this._ctx.canvas.toDataURL(type, quality);
  }

  fillImageByElement($el, { isOverlay = false } = {}) {
    if (!isDrawableElement($el))
      throw new TypeError("Passed element is not a drawable!");

    const ctx = this._ctx;
    // if isOverlay is true, do not clear current canvas
    if (!isOverlay) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage($el, 0, 0, ctx.canvas.width, ctx.canvas.height);

    this._saveHistory();
  }

  async fillImageByDataURL(src, { isOverlay = false } = {}) {
    if (!isBase64DataURL(src))
      throw new TypeError("Passed src is not a base64 data URL!");

    const img = await loadImage(src);

    const ctx = this._ctx;
    // if isOverlay is true, do not clear current canvas
    if (!isOverlay) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);

    this._saveHistory();
  }

  async undo() {
    this._history.undo();
    const base64 = this._history.value;
    if (!isBase64DataURL(base64)) return;

    const img = await loadImage(base64);

    const ctx = this._ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  async redo() {
    this._history.redo();
    const base64 = this._history.value;
    if (!isBase64DataURL(base64)) return;

    const img = await loadImage(base64);

    const ctx = this._ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  destroy() {
    this._unbindEvents();

    this._ev.removeAllListeners();
    this._history.clear();

    cancelAnimationFrame(this._timer);
    this._timer = null;
  }

  handleEvent(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    switch (ev.type) {
      case "mousedown":
      case "touchstart":
        this._onInputDown(ev);
        break;
      case "mousemove":
      case "touchmove":
        this._onInputMove(ev);
        break;
      case "mouseup":
      case "touchend":
        this._onInputUp();
        break;
      case "mouseout":
      case "touchcancel":
      case "gesturestart":
        this._onInputCancel();
        break;
      default:
    }
  }

  _bindEvents() {
    const events = isTouch()
      ? ["touchstart", "touchmove", "touchend", "touchcancel", "gesturestart"]
      : ["mousedown", "mousemove", "mouseup", "mouseout"];

    for (const ev of events) {
      this._$el.addEventListener(ev, this, false);
    }
  }
  _unbindEvents() {
    const events = isTouch()
      ? ["touchstart", "touchmove", "touchend", "touchcancel", "gesturestart"]
      : ["mousedown", "mousemove", "mouseup", "mouseout"];

    for (const ev of events) {
      this._$el.removeEventListener(ev, this, false);
    }
  }

  _drawFrame() {
    this._timer = requestAnimationFrame(() => this._drawFrame());

    if (!this._isDrawing) return;

    if (this._drawMode == Mode.DRAW || this._drawMode == Mode.ERASE){
      this._drawWithPen();
    }
  }

  _drawWithPen(){
    const isSameCoords =
      this._coords.old.x === this._coords.current.x &&
      this._coords.old.y === this._coords.current.y;

    const currentMid = getMidInputCoords(
      this._coords.old,
      this._coords.current
    );
    const ctx = this._ctx;

    ctx.beginPath();
    ctx.moveTo(currentMid.x, currentMid.y);
    ctx.quadraticCurveTo(
      this._coords.old.x,
      this._coords.old.y,
      this._coords.oldMid.x,
      this._coords.oldMid.y
    );
    ctx.stroke();

    this._coords.old = this._coords.current;
    this._coords.oldMid = currentMid;

    if (!isSameCoords) this._ev.trigger("draw", this._coords.current);
  }

  _drawFlood(){
    if(this._isFlooding){
      return;
    }

    this._isFlooding = true;

    const startX = Math.floor(this._coords.current.x);
    const startY = Math.floor(this._coords.current.y);

    const canvasWidth = this._ctx.canvas.width;
    const canvasHeight = this._ctx.canvas.height;


    this._imageData = this._ctx.getImageData(0,0,canvasWidth, canvasHeight);

    let pixelStack = [[startX, startY]];

    const startPos = (startY * canvasWidth + startX) * 4;

    const fillColor = this._hexToRgbA(this._ctx.strokeStyle);
    const targetColor = this._getTargetColor(startPos);

    console.log(fillColor);
    console.log(targetColor);

    if(fillColor[0] == targetColor[0] && fillColor[1] == targetColor[1] && fillColor[2] == targetColor[2]){
      this._isFlooding = false;
      return;
    }

    while(pixelStack.length > 0)
    {
      var newPos, x, y, pixelPos, reachLeft, reachRight;
      newPos = pixelStack.pop();
      x = newPos[0];
      y = newPos[1];

      pixelPos = (y*canvasWidth + x) * 4;
      while(y-- >= 0 && this._matchStartColor(pixelPos, targetColor))
      {
        pixelPos -= canvasWidth * 4;
      }
      pixelPos += canvasWidth * 4;
      ++y;
      reachLeft = false;
      reachRight = false;
      while(y++ < canvasHeight-1 && this._matchStartColor(pixelPos, targetColor))
      {
        this._colorPixel(pixelPos, fillColor);

        if(x > 0 && y > 0 && x < canvasWidth - 1 && y <= canvasHeight - 1)
        {
          if(this._matchStartColor(pixelPos - 4, targetColor))
          {
            if(!reachLeft){
              pixelStack.push([x - 1, y]);
              reachLeft = true;
            }
          }
          else if(reachLeft)
          {
            reachLeft = false;
          }
        }
      
        if(x > 0 && y > 0 && x < canvasWidth - 1 && y <= canvasHeight - 1)
        {
          if(this._matchStartColor(pixelPos + 4, targetColor))
          {
            if(!reachRight)
            {
              pixelStack.push([x + 1, y]);
              reachRight = true;
            }
          }
          else if(reachRight)
          {
            reachRight = false;
          }
        }
          
        pixelPos += canvasWidth * 4;
      }
    }
    this._isFlooding = false;
    this._ctx.putImageData(this._imageData, 0, 0);
  }

  _matchStartColor(pixelPos, targetColor){
    var r = this._imageData.data[pixelPos];	
    var g = this._imageData.data[pixelPos+1];	
    var b = this._imageData.data[pixelPos+2];

    return (r == targetColor[0] && g == targetColor[1] && b == targetColor[2]);
  }

  _hexToRgbA(hex){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return [(c>>16)&255, (c>>8)&255, c&255];
    }
    throw new Error('Bad Hex');
}

  _getTargetColor(pixelPos){
    var r = this._imageData.data[pixelPos];	
    var g = this._imageData.data[pixelPos+1];	
    var b = this._imageData.data[pixelPos+2];

    return [r,g,b];
  }

  _colorPixel(pixelPos, fillColor){
    this._imageData.data[pixelPos] = fillColor[0];
    this._imageData.data[pixelPos+1] = fillColor[1];
    this._imageData.data[pixelPos+2] = fillColor[2];
    this._imageData.data[pixelPos+3] = 255;
  }

  _onInputDown(ev) {
    this._isDrawing = true;

    const coords = getInputCoords(ev, this._$el);
    this._coords.current = this._coords.old = coords;
    this._coords.oldMid = getMidInputCoords(this._coords.old, coords);

    switch(this._drawMode){
      case Mode.DRAW:
        this._ev.trigger("drawBegin", this._coords.current);
        break;
      case Mode.ERASE:
        this._ev.trigger("eraseBegin", this._coords.current);
        break;
      case Mode.FLOOD:
        this._ev.trigger("floodBegin", this._coords.current);
        this._drawFlood();
        break;
    }
  }

  _onInputMove(ev) {
    this._coords.current = getInputCoords(ev, this._$el);
  }

  _onInputUp() {
    this._ev.trigger("drawEnd", this._coords.current);
    this._saveHistory();

    this._isDrawing = false;
  }

  _onInputCancel() {
    if (this._isDrawing) {
      this._ev.trigger("drawEnd", this._coords.current);
      this._saveHistory();
    }

    this._isDrawing = false;
  }

  _saveHistory() {
    this._history.save(this.toDataURL());
    this._ev.trigger("save", this._history.value);
  }
}
