;(function(global) {
  'use strict';

  var Assert = {
    _res: {
      pass: 0,
      fail: 0
    },
    assert: function(label, bool) {
      if (bool) {
        console.log(label, 'pass');
        Assert._res.pass++;
      } else {
        console.error(label, 'fail');
        Assert._res.fail++;
      }
    },
    result: function() {
      var pass = Assert._res.pass;
      var fail = Assert._res.fail;
      console.log('Pass: %s, Fail: %s', pass, fail);
      if (fail) {
        console.error('Test failed!');
      }
    }
  };
  var assert = Assert.assert;

  console.log('#SDB test');

  (function() {
    console.group('#instance');

    var c1 = document.createElement('canvas');
    var s1 = new global.SimpleDrawingBoard(c1);
    var c2 = document.createElement('canvas');
    var s2 = new global.SimpleDrawingBoard(c2);

    assert('different instance', s1 !== s2);
    assert('different canvas ctx', s1.ctx !== s2.ctx);

    console.groupEnd();
  }());


  (function() {
    console.group('#color canvas');

    var colorCanvas = document.createElement('canvas');
    var colorSDB    = new global.SimpleDrawingBoard(colorCanvas, { boardColor: '#000' });

    var black = colorSDB.getImg();
    var white = colorSDB.fill('#fff').getImg();
    assert('fill', white !== black);
    assert('clear', colorSDB.clear().getImg() === black);

    console.groupEnd();
  }());


  (function() {
    console.group('#transparent canvas');

    var transparentCanvas = document.createElement('canvas');
    var transparentSDB    = new global.SimpleDrawingBoard(transparentCanvas, { boardColor: 'transparent' });
    var cCanvas1 = document.createElement('canvas');
    var cSDB1    = new global.SimpleDrawingBoard(cCanvas1, { boardColor: 'rgba(0,0,0,0)' });
    var cCanvas2 = document.createElement('canvas');
    var cSDB2    = new global.SimpleDrawingBoard(cCanvas2, { boardColor: '#000' });

    var clear = transparentSDB.getImg();

    assert('constructor as transparentCanvas 1', clear === cSDB1.getImg());
    assert('constructor as transparentCanvas 2', clear !== cSDB2.getImg());

    var white = transparentSDB.fill('#fff').getImg();
    assert('fill', white !== clear);
    assert('clear', transparentSDB.clear().getImg() === clear);

    console.groupEnd();
  }());

  Assert.result();
}(window));
