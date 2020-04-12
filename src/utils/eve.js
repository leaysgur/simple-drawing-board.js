/**
 *
 * Minimul EventEmitter implementation
 * See `https://gist.github.com/leader22/3ab8416ce41883ae1ccd`
 *
 */
export class Eve {
  constructor() {
    this._events = {};
  }

  on(evName, handler) {
    const events = this._events;

    if (!(evName in events)) {
      events[evName] = [];
    }
    events[evName].push(handler);
  }

  off(evName, handler) {
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
  }

  trigger(evName, evData) {
    const events = this._events;

    if (!(evName in events)) {
      return;
    }

    for (let i = 0; i < events[evName].length; i++) {
      const handler = events[evName][i];
      handler.handleEvent
        ? handler.handleEvent.call(this, evData)
        : handler.call(this, evData);
    }
  }

  removeAllListeners() {
    this._events = {};
  }
}
