(function(global, undefined) {
  "use strict";

  const SimpleDrawingBoard = global.SimpleDrawingBoard;

  const c = document.getElementById("c");
  global.sdb = new SimpleDrawingBoard(c);
})(window);
