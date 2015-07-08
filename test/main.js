(function(global, undefined) {
  'use strict';

  var SimpleDrawingBoard = global.SimpleDrawingBoard;

  var c = document.getElementById('c');
  global.sdb = new SimpleDrawingBoard(c);

}(window));
