if ('process' in global) {
  throw new Error('This module is only for browser env.');
} else {
  window.SimpleDrawingBoard = require('./simple-drawing-board');
}
