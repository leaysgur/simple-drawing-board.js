# simple-drawing-board.js

Just simple minimal canvas drawing lib.

- 0 dependencies
- Mobile browser, IE11 compatibility
- Only 4.4KB(gzip)

## Install
```sh
npm i simple-drawing-board
```

or

```html
<script src="./path/to/dist/simple-drawing-board.min.js"></script>
```

## How to use
```html
<canvas id="canvas" width="500" height="300"></canvas>
```

```javascript
const sdb = new SimpleDrawingBoard(document.getElementById('canvas'));

// w/ options
const sdb = new SimpleDrawingBoard(document.getElementById('canvas'), {
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
sdb.setImg('data:image/png;base64,xxxxxx....');       // replace
sdb.setImg('data:image/png;base64,xxxxxx....', true); // overlay
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

## Events
Available events are below.

```javascript
sdb.ev.on('toggleMode', function(isDrawMode) {
    if (isDrawMode) {
        console.log('Draw mode.');
    } else {
        console.log('Erase mode.');
    }
});

sdb.ev.on('dispose', function() {
    console.log('Do something on dispose.');
});

sdb.ev.on('drawBegin', function(coords) {
    console.log(coords.x, coords.y);
});
sdb.ev.on('draw', function(coords) {
    console.log(coords.x, coords.y);
});
sdb.ev.on('drawEnd', function(coords) {
    console.log(coords.x, coords.y);
});

sdb.ev.on('save', function(curImg) {
    console.log(curImg); // 'data:image/png;base64,xxxxxx....'
});
```

## Alternatives
- [Fabric.js](https://github.com/kangax/fabric.js): More and more functions and utils.
- [drawingboard.js](https://github.com/Leimi/drawingboard.js): With jQuery.

## License
MIT
