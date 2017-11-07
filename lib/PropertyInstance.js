(function(definition){PropertyInstance=definition(typeof(Spark)!=="undefined"?Spark:this.Spark);PropertyInstance.definition=definition;if(typeof(module)!=="undefined"&&module!==null){module.exports=PropertyInstance;}else{if(typeof(Spark)!=="undefined"&&Spark!==null){Spark.PropertyInstance=PropertyInstance;}else{if(this.Spark==null){this.Spark={};}this.Spark.PropertyInstance=PropertyInstance;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : require('./Invalidator');
var PropertyInstance, slice = [].slice;

PropertyInstance = (function() {
  function PropertyInstance(property, obj) {
    this.property = property;
    this.obj = obj;
    this.init();
  }

  PropertyInstance.prototype.init = function() {
    this.value = this.ingest(this.property.options["default"]);
    this.calculated = false;
    this.initiated = false;
    return this.revalidateCallback = (function(_this) {
      return function() {
        return _this.get();
      };
    })(this);
  };

  PropertyInstance.prototype.get = function() {
    var initiated, old;
    if (this.property.options.get === false) {
      return void 0;
    } else if (typeof this.property.options.get === 'function') {
      return this.callOptionFunct("get");
    } else {
      if (this.invalidator) {
        this.invalidator.validateUnknowns();
      }
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
      this.revalidated();
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
      if (this._invalidateNotice()) {
        if (this.invalidator != null) {
          this.invalidator.unbind();
        }
      }
    }
    return this;
  };

  PropertyInstance.prototype.unknown = function() {
    if (this.calculated) {
      this._invalidateNotice();
    }
    return this;
  };

  PropertyInstance.prototype._invalidateNotice = function() {
    if (this.isImmediate()) {
      this.get();
      return false;
    } else {
      if (typeof this.obj.emitEvent === 'function') {
        this.obj.emitEvent(this.property.getInvalidateEventName());
      }
      if (this.getUpdater() != null) {
        this.getUpdater().bind();
      }
      return true;
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
    this.revalidated();
    return this.value;
  };

  PropertyInstance.prototype.revalidated = function() {
    this.calculated = true;
    this.initiated = true;
    if (this.getUpdater() != null) {
      return this.getUpdater().unbind();
    }
  };

  PropertyInstance.prototype.getUpdater = function() {
    if (typeof this.updater === 'undefined') {
      if (this.property.options.updater != null) {
        this.updater = this.property.options.updater;
        if (typeof this.updater.getBinder === 'function') {
          this.updater = this.updater.getBinder();
        }
        if (typeof this.updater.bind !== 'function' || typeof this.updater.unbind !== 'function') {
          console.error('Invalid updater');
          this.updater = null;
        } else {
          this.updater.callback = this.revalidateCallback;
        }
      } else {
        this.updater = null;
      }
    }
    return this.updater;
  };

  PropertyInstance.prototype.ingest = function(val) {
    if (typeof this.property.options.ingest === 'function') {
      return val = this.callOptionFunct("ingest", val);
    } else {
      return val;
    }
  };

  PropertyInstance.prototype.output = function() {
    if (typeof this.property.options.output === 'function') {
      return this.callOptionFunct("output", this.value);
    } else {
      return this.value;
    }
  };

  PropertyInstance.prototype.changed = function(old) {
    if (typeof this.property.options.change === 'function') {
      this.callOptionFunct("change", old);
    }
    if (typeof this.obj.emitEvent === 'function') {
      this.obj.emitEvent(this.property.getUpdateEventName(), [old]);
      return this.obj.emitEvent(this.property.getChangeEventName(), [old]);
    }
  };

  PropertyInstance.prototype.isImmediate = function() {
    return this.property.options.immediate !== false && (this.property.options.immediate === true || (typeof this.property.options.immediate === 'function' ? this.callOptionFunct("immediate") : (this.getUpdater() == null) && ((typeof this.obj.getListeners === 'function' && this.obj.getListeners(this.property.getChangeEventName()).length > 0) || typeof this.property.options.change === 'function')));
  };

  PropertyInstance.bind = function(target, prop) {
    var maj;
    maj = prop.name.charAt(0).toUpperCase() + prop.name.slice(1);
    Object.defineProperty(target, prop.name, {
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
    return target['invalidate' + maj] = function() {
      prop.getInstance(this).invalidate();
      return this;
    };
  };

  return PropertyInstance;

})();

return(PropertyInstance);});