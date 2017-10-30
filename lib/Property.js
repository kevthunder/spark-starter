var CollectionProperty, ComposedProperty, Property, PropertyInstance, ref, ref1, ref2;

PropertyInstance = ((ref = this.Spark) != null ? ref.PropertyInstance : void 0) || require('./PropertyInstance');

CollectionProperty = ((ref1 = this.Spark) != null ? ref1.CollectionProperty : void 0) || require('./CollectionProperty');

ComposedProperty = ((ref2 = this.Spark) != null ? ref2.ComposedProperty : void 0) || require('./ComposedProperty');

Property = (function() {
  function Property(name1, options1) {
    var calculated;
    this.name = name1;
    this.options = options1 != null ? options1 : {};
    calculated = false;
  }

  Property.prototype.bind = function(target) {
    var maj, parent, prop;
    prop = this;
    if (typeof target.getProperty === 'function' && ((parent = target.getProperty(this.name)) != null)) {
      this.override(parent);
    }
    maj = this.name.charAt(0).toUpperCase() + this.name.slice(1);
    Object.defineProperty(target, this.name, {
      configurable: true,
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
    if (parent != null) {
      target._properties = target._properties.filter(function(existing) {
        return existing !== parent;
      });
    }
    this.checkFunctions(target);
    this.checkAfterAddListener(target);
    return prop;
  };

  Property.prototype.override = function(parent) {
    var key, ref3, results, value;
    this.options.parent = parent.options;
    ref3 = parent.options;
    results = [];
    for (key in ref3) {
      value = ref3[key];
      if (typeof this.options[key] === 'function' && typeof value === 'function') {
        results.push(this.options[key].overrided = value);
      } else if (typeof this.options[key] === 'undefined') {
        results.push(this.options[key] = value);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Property.prototype.checkFunctions = function(target) {
    var funct, name, ref3, results;
    this.checkAfterAddListener(target);
    ref3 = Property.fn;
    results = [];
    for (name in ref3) {
      funct = ref3[name];
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
        this.addListener.overrided.call(this, evt, listener);
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
    var Type, varName;
    varName = this.getInstanceVarName();
    if (!this.isInstantiated(obj)) {
      Type = this.getInstanceType();
      obj[varName] = new Type(this, obj);
    }
    return obj[varName];
  };

  Property.prototype.getInstanceType = function() {
    if (this.options.composed != null) {
      return ComposedProperty;
    }
    if (this.options.collection != null) {
      return CollectionProperty;
    }
    return PropertyInstance;
  };

  Property.prototype.getChangeEventName = function() {
    return this.options.changeEventName || this.name + 'Changed';
  };

  Property.prototype.getUpdateEventName = function() {
    return this.options.changeEventName || this.name + 'Updated';
  };

  Property.prototype.getInvalidateEventName = function() {
    return this.options.changeEventName || this.name + 'Invalidated';
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
    setProperties: function(data, options) {
      var key, prop, val;
      if (options == null) {
        options = {};
      }
      for (key in data) {
        val = data[key];
        if (((options.whitelist == null) || options.whitelist.indexOf(key) !== -1) && ((options.blacklist == null) || options.blacklist.indexOf(key) === -1)) {
          prop = this.getPropertyInstance(key);
          if (prop != null) {
            prop.set(val);
          }
        }
      }
      return this;
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
