# simple-drawing-board.js
Just simple minimal canvas drawing lib.

- under 500 lines of codes
- minimal functions for drawing
- no dependencies
- Mobile compatibility

> You have to make your UIs by your own.

[DEMO](http://labs.lealog.net/sdb)

## How to use
```html
<canvas id="canvas" width="500" height="300"></canvas>
```

```javascript
var sdb = new SimpleDrawingBoard(document.getElementById('canvas'));
```

That's all!

### options
```javascript
var sdb = new SimpleDrawingBoard(document.getElementById('canvas'), {
  lineColor:    '#000',
  lineSize:     5,
  boardColor:   'transparent',
  historyDepth: 10
});
```

## APIs
### setLineSize
```javascript
sdb.setLineSize(10);
sdb.setLineSize(0);  // to be 1
sdb.setLineSize(-1); // to be 1
```

### setLineColor
```javascript
sdb.setLineColor('#0094c8');
sdb.setLineColor('red');
sdb.setLineColor('#0f0');
```

### fill
```javascript
sdb.fill('#000');
```

### clear
```javascript
sdb.clear(); // fill with default boardColor
```

### toggleMode
```javascript
// switch DRAW <=> ERASE
sdb.toggleMode(); // default is DRAW, so now mode is ERASE
```

### getImg
```javascript
sdb.getImg(); // 'data:image/png;base64,xxxxxx....'
```

### setImg
```javascript
sdb.setImg('data:image/png;base64,xxxxxx....');
```

### undo
```javascript
sdb.undo(); // go back history
```

### redo
```javascript
sdb.redo(); // go forward history
```

### dispose
```javascript
sdb.dispose(); // remove all events and clear history
```

## Alternate
- [Fabric.js](https://github.com/kangax/fabric.js): More and more functions and utils.
- [drawingboard.js](https://github.com/Leimi/drawingboard.js): Go with jQuery.
