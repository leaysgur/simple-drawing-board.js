;(function(global, undefined) {
'use strict';

if (!global.SimpleDrawingBoard) {
    throw new Error('SimpleDrawingBoard is not defined.');
}

global.SimpleDrawingBoard.util = {
    Eve: Eve,
    Const: {
        settings: {
            lineColor:  '#000',
            lineSize:   1,
            boardColor: '#eee'
        }
    }
};

function Eve() {
    this._events = {};
};
Eve.prototype = {
    constructor: Eve,
    on: function(evName, handler) {
        var events = this._events;

        if (!(evName in events)) {
            events[evName] = [];
        }
        events[evName].push(handler);
    },
    off: function(evName, handler) {
        var events = this._events;

        if (!(evName in events)) {
            return;
        }
        if (!handler) {
            events[evName] = [];
        }

        var handlerIdx = events[evName].indexOf(handler);
        if (handlerIdx >= 0) {
            events[evName].splice(handlerIdx, 1);
        }
    },
    trigger: function(evName, evData) {
        var events = this._events,
            handler;

        if (!(evName in events)) { return; }

        var i = 0, l = events[evName].length;
        for (; i < l; i++) {
            handler = events[evName][i];
            handler.handleEvent ? handler.handleEvent.call(this, evData)
                                : handler.call(this, evData);
        }
    }
};

}(window));
