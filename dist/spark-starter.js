(function() {
  var Element, EventBind, Invalidator, Property, PropertyInstance, Spark, pluck,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if (typeof Spark === "undefined" || Spark === null) {
    Spark = {};
  }

  EventBind = (function() {
    function EventBind(event1, target1, callback1) {
      this.event = event1;
      this.target = target1;
      this.callback = callback1;
      this.binded = false;
    }

    EventBind.prototype.bind = function() {
      if (!this.binded) {
        this.target.addListener(this.event, this.callback);
      }
      return this.binded = true;
    };

    EventBind.prototype.unbind = function() {
      if (this.binded) {
        this.target.removeListener(this.event, this.callback);
      }
      return this.binded = false;
    };

    EventBind.prototype.equals = function(eventBind) {
      return eventBind.event === this.event && eventBind.target === this.target && eventBind.callback === this.callback;
    };

    return EventBind;

  })();

  if (Spark != null) {
    Spark.EventBind = EventBind;
  }

  pluck = function(arr, fn) {
    var found, index;
    index = arr.findIndex(fn);
    if (index > -1) {
      found = arr[index];
      arr.splice(index, 1);
      return found;
    } else {
      return null;
    }
  };

  Invalidator = (function() {
    function Invalidator(property, obj1) {
      this.property = property;
      this.obj = obj1 != null ? obj1 : null;
      this.invalidationEvents = [];
      this.recycled = [];
      this.invalidateCallback = (function(_this) {
        return function() {
          _this.invalidate();
          return null;
        };
      })(this);
    }

    Invalidator.prototype.invalidate = function() {
      var functName;
      if (typeof this.property.invalidate === "function") {
        return this.property.invalidate();
      } else {
        functName = 'invalidate' + this.property.charAt(0).toUpperCase() + this.property.slice(1);
        if (typeof this.obj[functName] === "function") {
          return this.obj[functName]();
        } else {
          return this.obj[this.property] = null;
        }
      }
    };

    Invalidator.prototype.event = function(event, target) {
      if (target == null) {
        target = this;
      }
      if (!this.invalidationEvents.some(function(eventBind) {
        return eventBind.event === event && eventBind.target === target;
      })) {
        return this.invalidationEvents.push(pluck(this.recycled, function(eventBind) {
          return eventBind.event === event && eventBind.target === target;
        }) || new EventBind(event, target, this.invalidateCallback));
      }
    };

    Invalidator.prototype.value = function(val, event, target) {
      if (target == null) {
        target = this;
      }
      this.event(event, target);
      return val;
    };

    Invalidator.prototype.prop = function(prop, target) {
      if (target == null) {
        target = this;
      }
      return this.value(target[prop], prop + 'Changed', target);
    };

    Invalidator.prototype.isEmpty = function() {
      return this.invalidationEvents.length === 0;
    };

    Invalidator.prototype.bind = function() {
      return this.invalidationEvents.forEach(function(eventBind) {
        return eventBind.bind();
      });
    };

    Invalidator.prototype.recycle = function(callback) {
      var done, res;
      this.recycled = this.invalidationEvents;
      this.invalidationEvents = [];
      done = (function(_this) {
        return function() {
          _this.recycled.forEach(function(eventBind) {
            return eventBind.unbind();
          });
          return _this.recycled = [];
        };
      })(this);
      if (typeof callback === "function") {
        if (callback.length > 1) {
          return callback(this, done);
        } else {
          res = callback(this);
          done();
          return res;
        }
      } else {
        return done;
      }
    };

    Invalidator.prototype.unbind = function() {
      return this.invalidationEvents.forEach(function(eventBind) {
        return eventBind.unbind();
      });
    };

    return Invalidator;

  })();

  if (Spark != null) {
    Spark.Invalidator = Invalidator;
  }

  PropertyInstance = (function() {
    function PropertyInstance(property, obj1) {
      this.property = property;
      this.obj = obj1;
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

  if (Spark != null) {
    Spark.PropertyInstance = PropertyInstance;
  }

  Property = (function() {
    function Property(name1, options) {
      var calculated;
      this.name = name1;
      this.options = options != null ? options : {};
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

  if (Spark != null) {
    Spark.Property = Property;
  }

  Element = (function() {
    function Element() {}

    Element.elementKeywords = ['extended', 'included'];

    Element.prototype.tap = function(name) {
      var args;
      args = Array.prototype.slice.call(arguments);
      if (typeof name === 'function') {
        name.apply(this, args.slice(1));
      } else {
        this[name].apply(this, args.slice(1));
      }
      return this;
    };

    Element.prototype.callback = function(name) {
      if (this._callbacks == null) {
        this._callbacks = {};
      }
      if (this._callbacks[name] != null) {
        return this._callbacks[name];
      } else {
        return this._callbacks[name] = (function(_this) {
          return function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            _this[name].call(_this, args);
            return null;
          };
        })(this);
      }
    };

    Element.extend = function(obj) {
      var key, ref, value;
      for (key in obj) {
        value = obj[key];
        if (indexOf.call(Element.elementKeywords, key) < 0) {
          this[key] = value;
        }
      }
      if ((ref = obj.extended) != null) {
        ref.apply(this);
      }
      return this;
    };

    Element.include = function(obj) {
      var key, ref, value;
      for (key in obj) {
        value = obj[key];
        if (indexOf.call(Element.elementKeywords, key) < 0) {
          this.prototype[key] = value;
        }
      }
      if ((ref = obj.included) != null) {
        ref.apply(this);
      }
      return this;
    };

    Element.property = function(prop, desc) {
      return (new Property(prop, desc)).bind(this.prototype);
    };

    Element.properties = function(properties) {
      var desc, prop, results;
      results = [];
      for (prop in properties) {
        desc = properties[prop];
        results.push(this.property(prop, desc));
      }
      return results;
    };

    return Element;

  })();

  if (Spark != null) {
    Spark.Element = Element;
  }

  if (typeof module !== "undefined" && module !== null) {
    module.exports = Spark;
  } else {
    this.Spark = Spark;
  }

}).call(this);
