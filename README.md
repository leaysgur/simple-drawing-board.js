# simple-drawing-board.js

Just simple minimal canvas drawing lib.

- 0 dependencies
- Modern browser compatibility
- Under 500 lines of code

> For `v2.x` users, See https://github.com/leader22/simple-drawing-board.js/tree/v2.1.1

> For `v1.x` users, See https://github.com/leader22/simple-drawing-board.js/tree/v1.4.1


## Install
```sh
npm i simple-drawing-board
```

or

```html
<script src="./path/to/dist/simple-drawing-board.min.js"></script>
```

## How to use

Prepare your `canvas` element.

```html
<canvas id="canvas" width="500" height="300"></canvas>
```

Then create drawing board.

```javascript
import { create } from "simple-drawing-board.js";

const sdb = create(document.getElementById("canvas"));
```

## APIs

See also [type definitions](./index.d.ts).

### setLineSize()
```js
sdb.setLineSize(10);
sdb.setLineSize(0);  // to be 1
sdb.setLineSize(-1); // to be 1
```

### setLineColor()
```js
sdb.setLineColor("#0094c8");
sdb.setLineColor("red");
sdb.setLineColor("#0f0");
```

### fill()
```js
sdb.fill("#000");
sdb.fill("orange");
```

### clear()
```js
sdb.clear();
```

### toggleMode()
```js
// switch DRAW <=> ERASE
sdb.mode; // "draw"
sdb.toggleMode();
sdb.mode; // "erase"
```

### toDataURL()
```js
sdb.toDataURL(); // "data:image/png;base64,xxxxxx...."
sdb.toDataURL({ type: "image/jpeg" }); // "data:image/jpeg;base64,xxxxxx...."
sdb.toDataURL({ type: "image/jpeg", quality: 0.3 }); // compression quality
```

### fillImageByElement()
```js
sdb.fillImageByElement(document.getElementById("img"));
sdb.fillImageByElement(document.getElementById("img"), { isOverlay: true });
```


### async fillImageByDataURL()
```js
await sdb.fillImageByDataURL("data:image/png;base64,xxxxxx....");
await sdb.fillImageByDataURL("data:image/png;base64,xxxxxx....", { isOverlay: true });
```

### async undo()
```js
await sdb.undo();
```

### async redo()
```js
await sdb.redo();
```

### destroy()

Just detach from `canvas` element.

```js
sdb.destroy();
```

## Events

Events are available via `observer` property.

### drawBegin
```js
sdb.observer.on("drawBegin", (coords) => {
    console.log(coords.x, coords.y);
});
```

### draw
```js
sdb.observer.on("draw", (coords) => {
    console.log(coords.x, coords.y);
});
```

### drawEnd
```js
sdb.observer.on("drawEnd", (coords) => {
    console.log(coords.x, coords.y);
});
```

### save
```js
sdb.observer.on("save", (curImg) => {
    console.log(curImg); // "data:image/png;base64,xxxxxx...."
});
```

## Alternatives
- [Fabric.js](https://github.com/kangax/fabric.js): More and more functions and utils.
- [drawingboard.js](https://github.com/Leimi/drawingboard.js): With jQuery.

## License
MIT
