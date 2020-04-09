/**
 *
 * LIFO Stack Data Structure
 *
 */
export class Stack {
  constructor({ depth } = {}) {
    this._depth = depth || 10;
    this._items = [];
  }

  get size() {
    return this._items.length;
  }

  get(i) {
    return this._items[i];
  }

  push(item) {
    this._items.push(item);

    // limit size by depth
    while (this._items.length > this._depth) {
      this._items.shift();
    }
  }

  pop() {
    return this._items.pop();
  }

  clear() {
    this._items.length = 0;
  }
}
