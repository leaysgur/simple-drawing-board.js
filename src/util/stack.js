/**
 * Stack Data Structure
 */
function Stack() {
    this._items = [];
}

Stack.prototype = {
    constructor: Stack,
    get: function(i) {
        return this._items[i];
    },
    push: function(item) {
        this._items.push(item);
    },
    pop: function() {
        if (this._items.length > 0) {
            return this._items.pop();
        }
        return null;
    },
    shift: function() {
        if (this._items.length > 0) {
            return this._items.shift();
        }
        return null;
    },
    size: function() {
        return this._items.length;
    }
};

module.exports = Stack;
