var Invalidator, PropertyInstance, ref;

Invalidator = ((ref = this.Spark) != null ? ref.Invalidator : void 0) || require('./Invalidator');

PropertyInstance = (function() {
  function PropertyInstance(property, obj) {
    this.property = property;
    this.obj = obj;
    this.value = this.property.options["default"];
    this.calculated = false;
  }

  PropertyInstance.prototype.get = function() {
    if (this.property.options.get === false) {
      return void 0;
    } else if (typeof this.property.options.get === 'function') {
      return this.property.options.get.call(this.obj);
    } else {
      if (!this.calculated) {
        this.calcul();
      }
      return this.value;
    }
  };

  PropertyInstance.prototype.set = function(val) {
    var old;
    if (this.property.options.set === false) {
      void 0;
    } else if (typeof this.property.options.set === 'function') {
      this.property.options.set.call(this.obj, val);
    } else {
      val = this.ingest(val);
      if (this.value !== val) {
        old = this.value;
        this.value = val;
        this.changed(old);
      }
    }
    return this;
  };

  PropertyInstance.prototype.invalidate = function() {
    var old;
    if (this.calculated) {
      this.calculated = false;
      if (this.isImmediate()) {
        old = this.value;
        this.get();
        if (this.value !== old) {
          return this.changed(old);
        }
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

  PropertyInstance.prototype.calcul = function() {
    if (typeof this.property.options.calcul === 'function') {
      if (!this.invalidator) {
        this.invalidator = new Invalidator(this);
      }
      this.invalidator.recycle((function(_this) {
        return function(invalidator) {
          _this.value = _this.property.options.calcul.call(_this.obj, invalidator);
          if (invalidator.isEmpty()) {
            return _this.invalidator = null;
          } else {
            return invalidator.bind();
          }
        };
      })(this));
    }
    this.calculated = true;
    return this.value;
  };

  PropertyInstance.prototype.ingest = function(val) {
    if (typeof this.property.options.ingest === 'function') {
      return val = this.property.options.ingest.call(this.obj, val);
    } else {
      return val;
    }
  };

  PropertyInstance.prototype.changed = function(old) {
    if (typeof this.property.options.change === 'function') {
      this.property.options.change.call(this.obj, old);
    }
    if (typeof this.obj.emitEvent === 'function') {
      return this.obj.emitEvent(this.property.getChangeEventName(), [old]);
    }
  };

  PropertyInstance.prototype.isImmediate = function() {
    return this.property.options.immediate === true || (typeof this.obj.getListeners === 'function' && this.obj.getListeners(this.property.getChangeEventName()).length > 0);
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
