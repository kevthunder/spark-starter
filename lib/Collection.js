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
    this._addedFunctions = {};
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

  Collection.prototype.add = function(val) {
    if (!this._array.includes(val)) {
      return this.push(val);
    }
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

  Collection.readFunctions = ['every', 'find', 'findIndex', 'forEach', 'includes', 'indexOf', 'join', 'lastIndexOf', 'map', 'reduce', 'reduceRight', 'some', 'toString'];

  Collection.readListFunctions = ['concat', 'filter', 'slice'];

  Collection.writefunctions = ['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'];

  Collection.readFunctions.forEach(function(funct) {
    return Collection.prototype[funct] = function() {
      var arg, ref;
      arg = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref = this._array)[funct].apply(ref, arg);
    };
  });

  Collection.readListFunctions.forEach(function(funct) {
    return Collection.prototype[funct] = function() {
      var arg, ref;
      arg = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return this.copy((ref = this._array)[funct].apply(ref, arg));
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

  Collection.prototype.addFunctions = function(fn) {
    if (typeof fn === 'object') {
      Object.assign(this._addedFunctions, fn);
      return Object.assign(this, fn);
    }
  };

  Collection.prototype.copy = function(arr) {
    var coll;
    if (arr == null) {
      arr = this.toArray;
    }
    coll = new this.constructor(arr);
    coll.addFunctions(this._addedFunctions);
    return coll;
  };

  Collection.prototype.equals = function(arr) {
    return (this.count() === (tyepeof(arr.count === 'function') ? arr.count() : arr.length)) && this.every(function(val, i) {
      return arr[i] === val;
    });
  };

  Collection.prototype.getAddedFrom = function(arr) {
    return this._array.filter(function(item) {
      return !arr.includes(item);
    });
  };

  Collection.prototype.getRemovedFrom = function(arr) {
    return arr.filter((function(_this) {
      return function(item) {
        return !_this.includes(item);
      };
    })(this));
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
