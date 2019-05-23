/**
 * Stack Data Structure
 */
class Stack {
  constructor() {
    this._items = [];
  }

  get(i) {
    return this._items[i];
  }

  push(item) {
    this._items.push(item);
  }

  pop() {
    if (this._items.length > 0) {
      return this._items.pop();
    }
    return null;
  }

  shift() {
    if (this._items.length > 0) {
      return this._items.shift();
    }
    return null;
  }

  clear() {
    this._items.length = 0;
  }

  size() {
    return this._items.length;
  }
}

export default Stack;
