(function(definition){var Property=definition(typeof Spark!=="undefined"?Spark:this.Spark);Property.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Property;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Property=Property;}else{if(this.Spark==null){this.Spark={};}this.Spark.Property=Property;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var PropertyInstance = dependencies.hasOwnProperty("PropertyInstance") ? dependencies.PropertyInstance : require('./PropertyInstance');
var CollectionProperty = dependencies.hasOwnProperty("CollectionProperty") ? dependencies.CollectionProperty : require('./CollectionProperty');
var ComposedProperty = dependencies.hasOwnProperty("ComposedProperty") ? dependencies.ComposedProperty : require('./ComposedProperty');
var Property;
Property = (function() {
  Property.prototype.detectors = [ComposedProperty, CollectionProperty, PropertyInstance];

  function Property(name1, options1) {
    this.name = name1;
    this.options = options1 != null ? options1 : {};
  }

  Property.prototype.bind = function(target) {
    var parent, prop;
    prop = this;
    if (!(typeof target.getProperty === 'function' && target.getProperty(this.name) === this)) {
      if (typeof target.getProperty === 'function' && ((parent = target.getProperty(this.name)) != null)) {
        this.override(parent);
      }
      this.getInstanceType().bind(target, prop);
      target._properties = (target._properties || []).concat([prop]);
      if (parent != null) {
        target._properties = target._properties.filter(function(existing) {
          return existing !== parent;
        });
      }
      this.checkFunctions(target);
      this.checkAfterAddListener(target);
    }
    return prop;
  };

  Property.prototype.override = function(parent) {
    var key, ref, results, value;
    if (this.options.parent == null) {
      this.options.parent = parent.options;
      ref = parent.options;
      results = [];
      for (key in ref) {
        value = ref[key];
        if (typeof this.options[key] === 'function' && typeof value === 'function') {
          results.push(this.options[key].overrided = value);
        } else if (typeof this.options[key] === 'undefined') {
          results.push(this.options[key] = value);
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };

  Property.prototype.checkFunctions = function(target) {
    var funct, name, ref, results;
    this.checkAfterAddListener(target);
    ref = Property.fn;
    results = [];
    for (name in ref) {
      funct = ref[name];
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
    if (typeof target.addListener === 'function' && typeof target.afterAddListener === 'undefined' && typeof target.addListener.overrided === 'undefined') {
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
    if (!this.instanceType) {
      this.detectors.forEach((function(_this) {
        return function(detector) {
          return detector.detect(_this);
        };
      })(this));
    }
    return this.instanceType;
  };

  Property.fn = {
    getProperty: function(name) {
      return this._properties && this._properties.find(function(prop) {
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
    getManualDataProperties: function() {
      return this._properties.reduce((function(_this) {
        return function(res, prop) {
          var instance;
          if (prop.isInstantiated(_this)) {
            instance = prop.getInstance(_this);
            if (instance.calculated && instance.manual) {
              res[prop.name] = instance.value;
            }
          }
          return res;
        };
      })(this), {});
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
          if (prop.getInstanceType().prototype.changeEventName === event) {
            return prop.getInstance(_this).get();
          }
        };
      })(this));
    }
  };

  return Property;

})();

return(Property);});