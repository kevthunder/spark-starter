var Collection, Invalidator, PropertyInstance, ref, ref1,
  slice = [].slice;

Invalidator = ((ref = this.Spark) != null ? ref.Invalidator : void 0) || require('./Invalidator');

Collection = ((ref1 = this.Spark) != null ? ref1.Invalidator : void 0) || require('./Collection');

PropertyInstance = (function() {
  function PropertyInstance(property, obj) {
    this.property = property;
    this.obj = obj;
    this.value = this.ingest(this.property.options["default"]);
    this.calculated = false;
    this.initiated = false;
  }

  PropertyInstance.prototype.get = function() {
    var initiated, old;
    if (this.property.options.get === false) {
      return void 0;
    } else if (typeof this.property.options.get === 'function') {
      return this.callOptionFunct("get");
    } else {
      if (!this.calculated) {
        old = this.value;
        initiated = this.initiated;
        this.calcul();
        if (initiated && this.value !== old) {
          this.changed(old);
        }
      }
      return this.output();
    }
  };

  PropertyInstance.prototype.set = function(val) {
    var old;
    if (this.property.options.set === false) {
      void 0;
    } else if (typeof this.property.options.set === 'function') {
      this.callOptionFunct("set", val);
    } else {
      val = this.ingest(val);
      this.calculated = true;
      this.initiated = true;
      if (this.value !== val) {
        old = this.value;
        this.value = val;
        this.changed(old);
      }
    }
    return this;
  };

  PropertyInstance.prototype.invalidate = function() {
    if (this.calculated) {
      this.calculated = false;
      if (this.isImmediate()) {
        return this.get();
      } else if (this.invalidator != null) {
        return this.invalidator.unbind();
      }
    }
  };

  PropertyInstance.prototype.destroy = function() {
    if (this.invalidator != null) {
      return this.invalidator.unbind();
    }
  };

  PropertyInstance.prototype.callOptionFunct = function() {
    var args, funct;
    funct = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (typeof funct === 'string') {
      funct = this.property.options[funct];
    }
    if (typeof funct.overrided === 'function') {
      args.push((function(_this) {
        return function() {
          var args;
          args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return _this.callOptionFunct.apply(_this, [funct.overrided].concat(slice.call(args)));
        };
      })(this));
    }
    return funct.apply(this.obj, args);
  };

  PropertyInstance.prototype.calcul = function() {
    if (typeof this.property.options.calcul === 'function') {
      if (!this.invalidator) {
        this.invalidator = new Invalidator(this, this.obj);
      }
      this.invalidator.recycle((function(_this) {
        return function(invalidator, done) {
          _this.value = _this.callOptionFunct("calcul", invalidator);
          done();
          if (invalidator.isEmpty()) {
            return _this.invalidator = null;
          } else {
            return invalidator.bind();
          }
        };
      })(this));
    }
    this.calculated = true;
    this.initiated = true;
    return this.value;
  };

  PropertyInstance.prototype.isACollection = function(val) {
    return this.property.options.collection != null;
  };

  PropertyInstance.prototype.ingest = function(val) {
    if (typeof this.property.options.ingest === 'function') {
      return val = this.callOptionFunct("ingest", val);
    } else if (this.isACollection()) {
      if (val == null) {
        return [];
      } else if (typeof val.toArray === 'function') {
        return val.toArray();
      } else if (Array.isArray(val)) {
        return val.slice();
      } else {
        return [val];
      }
    } else {
      return val;
    }
  };

  PropertyInstance.prototype.output = function() {
    var col, prop;
    if (typeof this.property.options.output === 'function') {
      return this.callOptionFunct("output", this.value);
    } else if (this.isACollection()) {
      prop = this;
      col = Collection.newSubClass(this.property.options.collection, this.value);
      col.changed = function(old) {
        return prop.changed(old);
      };
      return col;
    } else {
      return this.value;
    }
  };

  PropertyInstance.prototype.changed = function(old) {
    if (typeof this.property.options.change === 'function') {
      this.callOptionFunct("change", old);
    }
    if (typeof this.obj.emitEvent === 'function') {
      return this.obj.emitEvent(this.property.getChangeEventName(), [old]);
    }
  };

  PropertyInstance.prototype.isImmediate = function() {
    return this.property.options.immediate !== false && (this.property.options.immediate === true || (typeof this.property.options.immediate === 'function' ? this.callOptionFunct("immediate") : (typeof this.obj.getListeners === 'function' && this.obj.getListeners(this.property.getChangeEventName()).length > 0) || typeof this.property.options.change === 'function'));
  };

  return PropertyInstance;

})();

if (typeof Spark !== "undefined" && Spark !== null) {
  Spark.PropertyInstance = PropertyInstance;
}

if (typeof module !== "undefined" && module !== null) {
  module.exports = PropertyInstance;
} else {
  if (this.Spark == null) {
    this.Spark = {};
  }
  this.Spark.PropertyInstance = PropertyInstance;
}
