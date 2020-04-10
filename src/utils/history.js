/**
 *
 * History for undo/redo Structure
 *
 *     past: [0, 1, 2, 3, 4, 5, 6, 7],
 *  present: 8,
 *   future: [9, 10]
 *
 */
export class History {
  constructor(initialValue) {
    this._past = [];
    this._present = initialValue || null;
    this._future = [];
  }

  get value() {
    return this._present;
  }

  undo() {
    if (this._past.length === 0) return;

    const previous = this._past[this._past.length - 1];
    const newPast = this._past.slice(0, this._past.length - 1);
    this._past = newPast;
    this._future = [this._present, ...this._future];
    this._present = previous;
  }

  redo() {
    if (this._future.length === 0) return;

    const next = this._future[0];
    const newFuture = this._future.slice(1);
    this._past = [...this._past, this._present];
    this._future = newFuture;
    this._present = next;
  }

  save(newPresent) {
    if (this._present === newPresent) return;

    this._past = [...this._past, this._present];
    this._future = [];
    this._present = newPresent;
  }
}
