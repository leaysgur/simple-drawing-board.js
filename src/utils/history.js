/**
 *
 * History for undo/redo Structure(mutable)
 * See `https://gist.github.com/leader22/9fbed07106d652ef40fda702da4f39c4`
 *
 */
export class History {
  /**
   *
   * @param [initialValue] {string}
   */
  constructor(initialValue = null) {
    /**
     *
     * @type {string[]}
     * @private
     */
    this._past = [];
    this._present = initialValue;
    /**
     *
     * @type {string[]}
     * @private
     */
    this._future = [];
  }

  /**
   *
   * @returns {string | null}
   */
  get value() {
    return this._present;
  }

  undo() {
    if (this._past.length === 0) return;

    const previous = this._past.pop();
    this._future.unshift(this._present);
    this._present = previous;
  }

  redo() {
    if (this._future.length === 0) return;

    const next = this._future.shift();
    this._past.push(this._present);
    this._present = next;
  }

  /**
   * @param newPresent {string}
   */
  save(newPresent) {
    if (this._present === newPresent) return;

    this._past.push(this._present);
    this._future.length = 0;
    this._present = newPresent;
  }

  clear() {
    this._past.length = 0;
    this._future.length = 0;
  }
}
