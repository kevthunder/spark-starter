(function(definition){var PropertyInstance=definition(typeof Spark!=="undefined"?Spark:this.Spark);PropertyInstance.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=PropertyInstance;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.PropertyInstance=PropertyInstance;}else{if(this.Spark==null){this.Spark={};}this.Spark.PropertyInstance=PropertyInstance;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : require('./Invalidator');
var PropertyInstance, slice = [].slice,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;
PropertyInstance = (function() {
  function PropertyInstance(property, obj) {
    this.property = property;
    this.obj = obj;
    this.init();
  }

  PropertyInstance.prototype.init = function() {
    this.value = this.ingest(this["default"]);
    this.calculated = false;
    return this.revalidateCallback = (function(_this) {
      return function() {
        return _this.get();
      };
    })(this);
  };

  PropertyInstance.prototype.callbackGet = function() {
    var res;
    res = this.callOptionFunct("get");
    this.revalidated();
    return res;
  };

  PropertyInstance.prototype.dynamicGet = function() {
    var initiated, old;
    if (this.invalidator) {
      this.invalidator.validateUnknowns();
    }
    if (this.isActive()) {
      if (!this.calculated) {
        old = this.value;
        initiated = this.initiated;
        this.calcul();
        if (this.value !== old) {
          if (initiated) {
            this.changed(old);
          } else if (typeof this.obj.emitEvent === 'function') {
            this.obj.emitEvent(this.updateEventName, [old]);
          }
        }
      }
      if (this.pendingChanges) {
        this.changed(this.pendingOld);
      }
      return this.output();
    } else {
      this.initiated = true;
      return void 0;
    }
  };

  PropertyInstance.prototype.set = function(val) {
    var old;
    if (typeof this.property.options.set === 'function') {
      this.callOptionFunct("set", val);
    } else {
      val = this.ingest(val);
      this.revalidated();
      if (this.value !== val) {
        old = this.value;
        this.value = val;
        this.manual = true;
        this.changed(old);
      }
    }
    return this;
  };

  PropertyInstance.prototype.invalidate = function() {
    if (this.calculated || this.active === false) {
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
    if (this.calculated || this.active === false) {
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
        this.obj.emitEvent(this.invalidateEventName);
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

  PropertyInstance.prototype.isActive = function() {
    var invalidator;
    if (typeof this.property.options.active === "boolean") {
      return this.property.options.active;
    } else if (typeof this.property.options.active === 'function') {
      invalidator = this.activeInvalidator || new Invalidator(this, this.obj);
      invalidator.recycle((function(_this) {
        return function(invalidator, done) {
          _this.active = _this.callOptionFunct("active", invalidator);
          done();
          if (_this.active || invalidator.isEmpty()) {
            invalidator.unbind();
            return _this.activeInvalidator = null;
          } else {
            _this.invalidator = invalidator;
            _this.activeInvalidator = invalidator;
            return invalidator.bind();
          }
        };
      })(this));
      return this.active;
    } else {
      return true;
    }
  };

  PropertyInstance.prototype.calcul = function() {
    if (typeof this.property.options.calcul === 'function') {
      if (!this.invalidator) {
        this.invalidator = new Invalidator(this, this.obj);
      }
      this.invalidator.recycle((function(_this) {
        return function(invalidator, done) {
          _this.value = _this.callOptionFunct("calcul", invalidator);
          _this.manual = false;
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
    if (this.isActive()) {
      this.pendingChanges = false;
      this.pendingOld = void 0;
      this.callChangedFunctions(old);
      if (typeof this.obj.emitEvent === 'function') {
        this.obj.emitEvent(this.updateEventName, [old]);
        this.obj.emitEvent(this.changeEventName, [old]);
      }
    } else {
      this.pendingChanges = true;
      if (typeof this.pendingOld === 'undefined') {
        this.pendingOld = old;
      }
    }
    return this;
  };

  PropertyInstance.prototype.callChangedFunctions = function(old) {
    if (typeof this.property.options.change === 'function') {
      return this.callOptionFunct("change", old);
    }
  };

  PropertyInstance.prototype.hasChangedFunctions = function() {
    return typeof this.property.options.change === 'function';
  };

  PropertyInstance.prototype.hasChangedEvents = function() {
    return typeof this.obj.getListeners === 'function' && this.obj.getListeners(this.changeEventName).length > 0;
  };

  PropertyInstance.prototype.isImmediate = function() {
    return this.property.options.immediate !== false && (this.property.options.immediate === true || (typeof this.property.options.immediate === 'function' ? this.callOptionFunct("immediate") : (this.getUpdater() == null) && (this.hasChangedEvents() || this.hasChangedFunctions())));
  };

  PropertyInstance.detect = function(prop) {
    if (prop.instanceType == null) {
      prop.instanceType = (function(superClass) {
        extend(_Class, superClass);

        function _Class() {
          return _Class.__super__.constructor.apply(this, arguments);
        }

        return _Class;

      })(PropertyInstance);
    }
    if (typeof prop.options.get === 'function') {
      prop.instanceType.prototype.get = this.prototype.callbackGet;
    } else {
      prop.instanceType.prototype.get = this.prototype.dynamicGet;
    }
    prop.instanceType.prototype["default"] = prop.options["default"];
    prop.instanceType.prototype.initiated = typeof prop.options["default"] !== 'undefined';
    return this.setEventNames(prop);
  };

  PropertyInstance.setEventNames = function(prop) {
    prop.instanceType.prototype.changeEventName = prop.options.changeEventName || prop.name + 'Changed';
    prop.instanceType.prototype.updateEventName = prop.options.updateEventName || prop.name + 'Updated';
    return prop.instanceType.prototype.invalidateEventName = prop.options.invalidateEventName || prop.name + 'Invalidated';
  };

  PropertyInstance.bind = function(target, prop) {
    var maj, opt;
    maj = prop.name.charAt(0).toUpperCase() + prop.name.slice(1);
    opt = {
      configurable: true,
      get: function() {
        return prop.getInstance(this).get();
      }
    };
    if (prop.options.set !== false) {
      opt.set = function(val) {
        return prop.getInstance(this).set(val);
      };
    }
    Object.defineProperty(target, prop.name, opt);
    target['get' + maj] = function() {
      return prop.getInstance(this).get();
    };
    if (prop.options.set !== false) {
      target['set' + maj] = function(val) {
        prop.getInstance(this).set(val);
        return this;
      };
    }
    return target['invalidate' + maj] = function() {
      prop.getInstance(this).invalidate();
      return this;
    };
  };

  return PropertyInstance;

})();

return(PropertyInstance);});