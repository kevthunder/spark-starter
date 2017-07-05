var Collection,
  slice = [].slice;

Collection = (function() {
  function Collection(arr) {
    if (arr != null) {
      if (typeof arr.toArray === 'function') {
        this._array = arr.toArray();
      } else if (Array.isArray(arr)) {
        this._array = arr;
      } else {
        this._array = [arr];
      }
    } else {
      this._array = [];
    }
  }

  Collection.prototype.changed = function() {};

  Collection.prototype.get = function(i) {
    return this._array[i];
  };

  Collection.prototype.set = function(i, val) {
    var old;
    if (this._array[i] !== val) {
      old = this.toArray();
      this._array[i] = val;
      this.changed(old);
    }
    return val;
  };

  Collection.prototype.remove = function(val) {
    var index, old;
    index = this._array.indexOf(val);
    if (index !== -1) {
      old = this.toArray();
      this._array.splice(index, 1);
      return this.changed(old);
    }
  };

  Collection.prototype.toArray = function() {
    return this._array.slice();
  };

  Collection.prototype.count = function() {
    return this._array.length;
  };

  Collection.readFunctions = ['concat', 'every', 'filter', 'find', 'findIndex', 'forEach', 'includes', 'indexOf', 'join', 'lastIndexOf', 'map', 'reduce', 'reduceRight', 'slice', 'some', 'toString'];

  Collection.writefunctions = ['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'];

  Collection.readFunctions.forEach(function(funct) {
    return Collection.prototype[funct] = function() {
      var arg, ref;
      arg = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref = this._array)[funct].apply(ref, arg);
    };
  });

  Collection.writefunctions.forEach(function(funct) {
    return Collection.prototype[funct] = function() {
      var arg, old, ref, res;
      arg = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      old = this.toArray();
      res = (ref = this._array)[funct].apply(ref, arg);
      this.changed(old);
      return res;
    };
  });

  Collection.prototype.equals = function(arr) {
    return (this.count() === (tyepeof(arr.count === 'function') ? arr.count() : arr.length)) && this.every(function(val, i) {
      return arr[i] === val;
    });
  };

  return Collection;

})();

if (typeof Spark !== "undefined" && Spark !== null) {
  Spark.Collection = Collection;
}

if (typeof module !== "undefined" && module !== null) {
  module.exports = Collection;
} else {
  if (this.Spark == null) {
    this.Spark = {};
  }
  this.Spark.Collection = Collection;
}
