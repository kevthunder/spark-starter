var Property, PropertyInstance, ref;

PropertyInstance = ((ref = this.Spark) != null ? ref.PropertyInstance : void 0) || require('./PropertyInstance');

Property = (function() {
  function Property(name1, options) {
    var calculated;
    this.name = name1;
    this.options = options;
    calculated = false;
  }

  Property.prototype.bind = function(target) {
    var maj, prop;
    prop = this;
    maj = this.name.charAt(0).toUpperCase() + this.name.slice(1);
    Object.defineProperty(target, this.name, {
      get: function() {
        return prop.getInstance(this).get();
      },
      set: function(val) {
        return prop.getInstance(this).set(val);
      }
    });
    target['get' + maj] = function() {
      return prop.getInstance(this).get();
    };
    target['set' + maj] = function(val) {
      prop.getInstance(this).set(val);
      return this;
    };
    target['invalidate' + maj] = function() {
      prop.getInstance(this).invalidate();
      return this;
    };
    target._properties = (target._properties || []).concat([prop]);
    this.checkFunctions(target);
    return this.checkAfterAddListener(target);
  };

  Property.prototype.checkFunctions = function(target) {
    var funct, name, ref1, results;
    this.checkAfterAddListener(target);
    ref1 = Property.fn;
    results = [];
    for (name in ref1) {
      funct = ref1[name];
      if (typeof target[name] === 'undefined') {
        results.push(target[name] = funct);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Property.prototype.checkAfterAddListener = function(target) {
    var overrided;
    if (typeof target.addListener === 'function' && typeof target.afterAddListener === 'undefined') {
      target.afterAddListener = Property.optionalFn.afterAddListener;
      overrided = target.addListener;
      target.addListener = function(evt, listener) {
        this.addListener.overrided(evt, listener);
        return this.afterAddListener(evt);
      };
      return target.addListener.overrided = overrided;
    }
  };

  Property.prototype.getInstanceVarName = function() {
    return this.options.instanceVarName || '_' + this.name;
  };

  Property.prototype.isInstantiated = function(obj) {
    return obj[this.getInstanceVarName()] != null;
  };

  Property.prototype.getInstance = function(obj) {
    var varName;
    varName = this.getInstanceVarName();
    if (!this.isInstantiated(obj)) {
      obj[varName] = new PropertyInstance(this, obj);
    }
    return obj[varName];
  };

  Property.prototype.getChangeEventName = function() {
    return this.options.changeEventName || this.name + 'Changed';
  };

  Property.fn = {
    getProperty: function(name) {
      return this._properties.find(function(prop) {
        return prop.name === name;
      });
    },
    getPropertyInstance: function(name) {
      var res;
      res = this.getProperty(name);
      if (res) {
        return res.getInstance(this);
      }
    },
    getProperties: function() {
      return this._properties.slice();
    },
    getPropertyInstances: function() {
      return this._properties.map((function(_this) {
        return function(prop) {
          return prop.getInstance(_this);
        };
      })(this));
    },
    getInstantiatedProperties: function() {
      return this._properties.filter((function(_this) {
        return function(prop) {
          return prop.isInstantiated(_this);
        };
      })(this)).map((function(_this) {
        return function(prop) {
          return prop.getInstance(_this);
        };
      })(this));
    },
    destroyProperties: function() {
      this.getInstantiatedProperties().forEach((function(_this) {
        return function(prop) {
          return prop.destroy();
        };
      })(this));
      this._properties = [];
      return true;
    }
  };

  Property.optionalFn = {
    afterAddListener: function(event) {
      return this._properties.forEach((function(_this) {
        return function(prop) {
          if (prop.getChangeEventName() === event) {
            return prop.getInstance(_this).get();
          }
        };
      })(this));
    }
  };

  return Property;

})();

if (typeof Spark !== "undefined" && Spark !== null) {
  Spark.Property = Property;
}

if (typeof module !== "undefined" && module !== null) {
  module.exports = Property;
} else {
  if (this.Spark == null) {
    this.Spark = {};
  }
  this.Spark.Property = Property;
}
