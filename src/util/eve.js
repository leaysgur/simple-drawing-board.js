/**
 * Minimal event interface
 * See `https://gist.github.com/leader22/3ab8416ce41883ae1ccd`
 *
 */
function Eve() {
    this._events = {};
}
Eve.prototype = {
    constructor: Eve,
    on: function(evName, handler) {
        const events = this._events;

        if (!(evName in events)) {
            events[evName] = [];
        }
        events[evName].push(handler);
    },
    off: function(evName, handler) {
        const events = this._events;

        if (!(evName in events)) {
            return;
        }
        if (!handler) {
            events[evName] = [];
        }

        const handlerIdx = events[evName].indexOf(handler);
        if (handlerIdx >= 0) {
            events[evName].splice(handlerIdx, 1);
        }
    },
    trigger: function(evName, evData) {
        const events = this._events;

        if (!(evName in events)) { return; }

        let i = 0;
        const l = events[evName].length;
        for (; i < l; i++) {
            const handler = events[evName][i];
            handler.handleEvent ? handler.handleEvent.call(this, evData)
                                : handler.call(this, evData);
        }
    }
};

module.exports = Eve;
