(function() {
  var Spark,
    slice = [].slice,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Spark = typeof module !== "undefined" && module !== null ? module.exports = {} : (this.Spark == null ? this.Spark = {} : void 0, this.Spark);

  (function(definition) {
    Spark.PropertyInstance = definition();
    return Spark.PropertyInstance.definition = definition;
  })(function() {
    var PropertyInstance;
    PropertyInstance = (function() {
      function PropertyInstance(property1, obj1) {
        this.property = property1;
        this.obj = obj1;
        this.init();
      }

      PropertyInstance.prototype.init = function() {
        this.value = this.ingest(this["default"]);
        return this.calculated = false;
      };

      PropertyInstance.prototype.get = function() {
        this.calculated = true;
        return this.output();
      };

      PropertyInstance.prototype.set = function(val) {
        return this.setAndCheckChanges(val);
      };

      PropertyInstance.prototype.callbackSet = function(val) {
        this.callOptionFunct("set", val);
        return this;
      };

      PropertyInstance.prototype.setAndCheckChanges = function(val) {
        var old;
        val = this.ingest(val);
        this.revalidated();
        if (this.value !== val) {
          old = this.value;
          this.value = val;
          this.manual = true;
          this.changed(old);
        }
        return this;
      };

      PropertyInstance.prototype.destroy = function() {};

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

      PropertyInstance.prototype.revalidated = function() {
        this.calculated = true;
        return this.initiated = true;
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
        this.callChangedFunctions(old);
        if (typeof this.obj.emitEvent === 'function') {
          this.obj.emitEvent(this.updateEventName, [old]);
          this.obj.emitEvent(this.changeEventName, [old]);
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

      PropertyInstance.compose = function(prop) {
        if (prop.instanceType == null) {
          prop.instanceType = (function(superClass) {
            extend(_Class, superClass);

            function _Class() {
              return _Class.__super__.constructor.apply(this, arguments);
            }

            return _Class;

          })(PropertyInstance);
        }
        if (typeof prop.options.set === 'function') {
          prop.instanceType.prototype.set = this.prototype.callbackSet;
        } else {
          prop.instanceType.prototype.set = this.prototype.setAndCheckChanges;
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
    return PropertyInstance;
  });

  (function(definition) {
    Spark.Binder = definition();
    return Spark.Binder.definition = definition;
  })(function() {
    var Binder;
    Binder = (function() {
      function Binder(target1, callback1) {
        this.target = target1;
        this.callback = callback1;
        this.binded = false;
      }

      Binder.prototype.bind = function() {
        if (!this.binded && (this.callback != null) && (this.target != null)) {
          this.doBind();
        }
        return this.binded = true;
      };

      Binder.prototype.doBind = function() {
        throw new Error('Not implemented');
      };

      Binder.prototype.unbind = function() {
        if (this.binded && (this.callback != null) && (this.target != null)) {
          this.doUnbind();
        }
        return this.binded = false;
      };

      Binder.prototype.doUnbind = function() {
        throw new Error('Not implemented');
      };

      Binder.prototype.equals = function(binder) {
        return binder.constructor === this.constructor && binder.target === this.target && this.compareCallback(binder.callback);
      };

      Binder.prototype.compareCallback = function(callback) {
        return callback === this.callback || ((callback.maker != null) && callback.maker === this.callback.maker && callback.uses.length === this.callback.uses.length && this.callback.uses.every(function(arg, i) {
          return arg === callback.uses[i];
        }));
      };

      return Binder;

    })();
    return Binder;
  });

  (function(definition) {
    Spark.EventBind = definition();
    return Spark.EventBind.definition = definition;
  })(function(dependencies) {
    var Binder, EventBind;
    if (dependencies == null) {
      dependencies = {};
    }
    Binder = dependencies.hasOwnProperty("Binder") ? dependencies.Binder : Spark.Binder;
    EventBind = (function(superClass) {
      extend(EventBind, superClass);

      function EventBind(event1, target, callback) {
        this.event = event1;
        EventBind.__super__.constructor.call(this, target, callback);
      }

      EventBind.prototype.doBind = function() {
        if (typeof this.target.addEventListener === 'function') {
          return this.target.addEventListener(this.event, this.callback);
        } else if (typeof this.target.addListener === 'function') {
          return this.target.addListener(this.event, this.callback);
        } else if (typeof this.target.on === 'function') {
          return this.target.on(this.event, this.callback);
        } else {
          throw new Error('No function to add event listeners was found');
        }
      };

      EventBind.prototype.doUnbind = function() {
        if (typeof this.target.removeEventListener === 'function') {
          return this.target.removeEventListener(this.event, this.callback);
        } else if (typeof this.target.removeListener === 'function') {
          return this.target.removeListener(this.event, this.callback);
        } else if (typeof this.target.off === 'function') {
          return this.target.off(this.event, this.callback);
        } else {
          throw new Error('No function to remove event listeners was found');
        }
      };

      EventBind.prototype.equals = function(eventBind) {
        return EventBind.__super__.equals.call(this, eventBind) && eventBind.event === this.event;
      };

      EventBind.prototype.match = function(event, target) {
        return event === this.event && target === this.target;
      };

      EventBind.checkEmitter = function(emitter, fatal) {
        if (fatal == null) {
          fatal = true;
        }
        if (typeof emitter.addEventListener === 'function' || typeof emitter.addListener === 'function' || typeof emitter.on === 'function') {
          return true;
        } else if (fatal) {
          throw new Error('No function to add event listeners was found');
        } else {
          return false;
        }
      };

      return EventBind;

    })(Binder);
    return EventBind;
  });

  (function(definition) {
    Spark.Invalidator = definition();
    return Spark.Invalidator.definition = definition;
  })(function(dependencies) {
    var EventBind, Invalidator, pluck;
    if (dependencies == null) {
      dependencies = {};
    }
    EventBind = dependencies.hasOwnProperty("EventBind") ? dependencies.EventBind : Spark.EventBind;
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
      Invalidator.strict = true;

      function Invalidator(property1, obj1) {
        this.property = property1;
        this.obj = obj1 != null ? obj1 : null;
        this.invalidationEvents = [];
        this.recycled = [];
        this.unknowns = [];
        this.strict = this.constructor.strict;
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

      Invalidator.prototype.unknown = function() {
        if (typeof this.property.unknown === "function") {
          return this.property.unknown();
        } else {
          return this.invalidate();
        }
      };

      Invalidator.prototype.addEventBind = function(event, target, callback) {
        return this.addBinder(new EventBind(event, target, callback));
      };

      Invalidator.prototype.addBinder = function(binder) {
        if (binder.callback == null) {
          binder.callback = this.invalidateCallback;
        }
        if (!this.invalidationEvents.some(function(eventBind) {
          return eventBind.equals(binder);
        })) {
          return this.invalidationEvents.push(pluck(this.recycled, function(eventBind) {
            return eventBind.equals(binder);
          }) || binder);
        }
      };

      Invalidator.prototype.getUnknownCallback = function(prop, target) {
        var callback;
        callback = (function(_this) {
          return function() {
            if (!_this.unknowns.some(function(unknown) {
              return unknown.prop === prop && unknown.target === target;
            })) {
              _this.unknowns.push({
                "prop": prop,
                "target": target
              });
              return _this.unknown();
            }
          };
        })(this);
        callback.maker = arguments.callee;
        callback.uses = Array.from(arguments);
        return callback;
      };

      Invalidator.prototype.event = function(event, target) {
        if (target == null) {
          target = this.obj;
        }
        if (this.checkEmitter(target)) {
          return this.addEventBind(event, target);
        }
      };

      Invalidator.prototype.value = function(val, event, target) {
        if (target == null) {
          target = this.obj;
        }
        this.event(event, target);
        return val;
      };

      Invalidator.prototype.prop = function(prop, target) {
        if (target == null) {
          target = this.obj;
        }
        if (typeof prop !== 'string') {
          throw new Error('Property name must be a string');
        }
        if (this.checkEmitter(target)) {
          this.addEventBind(prop + 'Invalidated', target, this.getUnknownCallback(prop, target));
          return this.value(target[prop], prop + 'Updated', target);
        } else {
          return target[prop];
        }
      };

      Invalidator.prototype.propInitiated = function(prop, target) {
        var initiated;
        if (target == null) {
          target = this.obj;
        }
        initiated = target.getPropertyInstance(prop).initiated;
        if (!initiated && this.checkEmitter(target)) {
          this.event(prop + 'Updated', target);
        }
        return initiated;
      };

      Invalidator.prototype.validateUnknowns = function(prop, target) {
        var unknowns;
        if (target == null) {
          target = this.obj;
        }
        unknowns = this.unknowns;
        this.unknowns = [];
        return unknowns.forEach(function(unknown) {
          return unknown.target[unknown.prop];
        });
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

      Invalidator.prototype.checkEmitter = function(emitter) {
        return EventBind.checkEmitter(emitter, this.strict);
      };

      Invalidator.prototype.unbind = function() {
        return this.invalidationEvents.forEach(function(eventBind) {
          return eventBind.unbind();
        });
      };

      return Invalidator;

    })();
    return Invalidator;
  });

  (function(definition) {
    Spark.ActivableProperty = definition();
    return Spark.ActivableProperty.definition = definition;
  })(function(dependencies) {
    var ActivableProperty, Invalidator, PropertyInstance;
    if (dependencies == null) {
      dependencies = {};
    }
    Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : Spark.Invalidator;
    PropertyInstance = dependencies.hasOwnProperty("PropertyInstance") ? dependencies.PropertyInstance : Spark.PropertyInstance;
    ActivableProperty = (function(superClass) {
      extend(ActivableProperty, superClass);

      function ActivableProperty() {
        return ActivableProperty.__super__.constructor.apply(this, arguments);
      }

      ActivableProperty.prototype.activableGet = function() {
        return this.get();
      };

      ActivableProperty.prototype.activableGet = function() {
        var out;
        if (this.isActive()) {
          out = this.activeGet();
          if (this.pendingChanges) {
            this.changed(this.pendingOld);
          }
          return out;
        } else {
          this.initiated = true;
          return void 0;
        }
      };

      ActivableProperty.prototype.isActive = function() {
        return true;
      };

      ActivableProperty.prototype.manualActive = function() {
        return this.active;
      };

      ActivableProperty.prototype.callbackActive = function() {
        var invalidator;
        invalidator = this.activeInvalidator || new Invalidator(this, this.obj);
        invalidator.recycle((function(_this) {
          return function(invalidator, done) {
            _this.active = _this.callOptionFunct(_this.activeFunct, invalidator);
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
      };

      ActivableProperty.prototype.activeChanged = function(old) {
        return this.changed(old);
      };

      ActivableProperty.prototype.activableChanged = function(old) {
        if (this.isActive()) {
          this.pendingChanges = false;
          this.pendingOld = void 0;
          this.activeChanged();
        } else {
          this.pendingChanges = true;
          if (typeof this.pendingOld === 'undefined') {
            this.pendingOld = old;
          }
        }
        return this;
      };

      ActivableProperty.compose = function(prop) {
        if (typeof prop.options.active !== "undefined") {
          prop.instanceType.prototype.activeGet = prop.instanceType.prototype.get;
          prop.instanceType.prototype.get = this.prototype.activableGet;
          prop.instanceType.prototype.activeChanged = prop.instanceType.prototype.changed;
          prop.instanceType.prototype.changed = this.prototype.activableChanged;
          if (typeof prop.options.active === "boolean") {
            prop.instanceType.prototype.active = prop.options.active;
            return prop.instanceType.prototype.isActive = this.prototype.manualActive;
          } else if (typeof prop.options.active === 'function') {
            prop.instanceType.prototype.activeFunct = prop.options.active;
            return prop.instanceType.prototype.isActive = this.prototype.callbackActive;
          }
        }
      };

      return ActivableProperty;

    })(PropertyInstance);
    return ActivableProperty;
  });

  (function(definition) {
    Spark.DynamicProperty = definition();
    return Spark.DynamicProperty.definition = definition;
  })(function(dependencies) {
    var DynamicProperty, Invalidator, PropertyInstance;
    if (dependencies == null) {
      dependencies = {};
    }
    Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : Spark.Invalidator;
    PropertyInstance = dependencies.hasOwnProperty("PropertyInstance") ? dependencies.PropertyInstance : Spark.PropertyInstance;
    DynamicProperty = (function(superClass) {
      extend(DynamicProperty, superClass);

      function DynamicProperty() {
        return DynamicProperty.__super__.constructor.apply(this, arguments);
      }

      DynamicProperty.prototype.init = function() {
        DynamicProperty.__super__.init.call(this);
        return this.initRevalidate();
      };

      DynamicProperty.prototype.initRevalidate = function() {
        return this.revalidateCallback = (function(_this) {
          return function() {
            return _this.get();
          };
        })(this);
      };

      DynamicProperty.prototype.callbackGet = function() {
        var res;
        res = this.callOptionFunct("get");
        this.revalidated();
        return res;
      };

      DynamicProperty.prototype.invalidate = function() {
        if (this.calculated || this.active === false) {
          this.calculated = false;
          this._invalidateNotice();
        }
        return this;
      };

      DynamicProperty.prototype.revalidate = function() {
        DynamicProperty.__super__.revalidate.call(this);
        return this.revalidateUpdater();
      };

      DynamicProperty.prototype.revalidateUpdater = function() {
        if (this.getUpdater() != null) {
          return this.getUpdater().unbind();
        }
      };

      DynamicProperty.prototype._invalidateNotice = function() {
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

      DynamicProperty.prototype.getUpdater = function() {
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

      DynamicProperty.prototype.isImmediate = function() {
        return this.property.options.immediate !== false && (this.property.options.immediate === true || (typeof this.property.options.immediate === 'function' ? this.callOptionFunct("immediate") : (this.getUpdater() == null) && (this.hasChangedEvents() || this.hasChangedFunctions())));
      };

      DynamicProperty.compose = function(prop) {
        if (typeof prop.options.get === 'function' || typeof prop.options.calcul === 'function' || typeof prop.options.active === 'function') {
          if (prop.instanceType == null) {
            prop.instanceType = (function(superClass1) {
              extend(_Class, superClass1);

              function _Class() {
                return _Class.__super__.constructor.apply(this, arguments);
              }

              return _Class;

            })(DynamicProperty);
          }
        }
        if (typeof prop.options.get === 'function') {
          return prop.instanceType.prototype.get = this.prototype.callbackGet;
        }
      };

      return DynamicProperty;

    })(PropertyInstance);
    return DynamicProperty;
  });

  (function(definition) {
    Spark.CalculatedProperty = definition();
    return Spark.CalculatedProperty.definition = definition;
  })(function(dependencies) {
    var CalculatedProperty, DynamicProperty, Invalidator;
    if (dependencies == null) {
      dependencies = {};
    }
    Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : Spark.Invalidator;
    DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : Spark.DynamicProperty;
    CalculatedProperty = (function(superClass) {
      extend(CalculatedProperty, superClass);

      function CalculatedProperty() {
        return CalculatedProperty.__super__.constructor.apply(this, arguments);
      }

      CalculatedProperty.prototype.calculatedGet = function() {
        var initiated, old;
        if (this.invalidator) {
          this.invalidator.validateUnknowns();
        }
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
        return this.output();
      };

      CalculatedProperty.prototype.calcul = function() {
        this.revalidated();
        return this.value;
      };

      CalculatedProperty.prototype.callbackCalcul = function() {
        this.value = this.callOptionFunct(this.calculFunct);
        this.manual = false;
        this.revalidated();
        return this.value;
      };

      CalculatedProperty.prototype.invalidatedCalcul = function() {
        if (!this.invalidator) {
          this.invalidator = new Invalidator(this, this.obj);
        }
        this.invalidator.recycle((function(_this) {
          return function(invalidator, done) {
            _this.value = _this.callOptionFunct(_this.calculFunct, invalidator);
            _this.manual = false;
            done();
            if (invalidator.isEmpty()) {
              return _this.invalidator = null;
            } else {
              return invalidator.bind();
            }
          };
        })(this));
        this.revalidated();
        return this.value;
      };

      CalculatedProperty.prototype.unknown = function() {
        if (this.calculated || this.active === false) {
          this._invalidateNotice();
        }
        return this;
      };

      CalculatedProperty.prototype.destroyWhithoutInvalidator = function() {
        return this.destroy();
      };

      CalculatedProperty.prototype.destroyInvalidator = function() {
        this.destroyWhithoutInvalidator();
        if (this.invalidator != null) {
          return this.invalidator.unbind();
        }
      };

      CalculatedProperty.prototype.invalidateInvalidator = function() {
        if (this.calculated || this.active === false) {
          this.calculated = false;
          if (this._invalidateNotice() && (this.invalidator != null)) {
            this.invalidator.unbind();
          }
        }
        return this;
      };

      CalculatedProperty.compose = function(prop) {
        if (typeof prop.options.calcul === 'function') {
          prop.instanceType.prototype.calculFunct = prop.options.calcul;
          prop.instanceType.prototype.get = this.prototype.calculatedGet;
          if (prop.options.calcul.length > 0) {
            prop.instanceType.prototype.calcul = this.prototype.invalidatedCalcul;
            prop.instanceType.prototype.destroyWhithoutInvalidator = prop.instanceType.prototype.destroy;
            prop.instanceType.prototype.destroy = this.prototype.destroyInvalidator;
            prop.instanceType.prototype.invalidate = this.prototype.invalidateInvalidator;
            return prop.instanceType.prototype.unknown = this.prototype.unknown;
          } else {
            return prop.instanceType.prototype.calcul = this.prototype.callbackCalcul;
          }
        }
      };

      return CalculatedProperty;

    })(DynamicProperty);
    return CalculatedProperty;
  });

  (function(definition) {
    Spark.Collection = definition();
    return Spark.Collection.definition = definition;
  })(function() {
    var Collection;
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

      Collection.newSubClass = function(fn, arr) {
        var SubClass;
        if (typeof fn === 'object') {
          SubClass = (function(superClass) {
            extend(_Class, superClass);

            function _Class() {
              return _Class.__super__.constructor.apply(this, arguments);
            }

            return _Class;

          })(this);
          Object.assign(SubClass.prototype, fn);
          return new SubClass(arr);
        } else {
          return new this(arr);
        }
      };

      Collection.prototype.copy = function(arr) {
        var coll;
        if (arr == null) {
          arr = this.toArray();
        }
        coll = new this.constructor(arr);
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
    Object.defineProperty(Collection.prototype, 'length', {
      get: function() {
        return this.count();
      }
    });
    if (typeof Symbol !== "undefined" && Symbol !== null ? Symbol.iterator : void 0) {
      Collection.prototype[Symbol.iterator] = function() {
        return this._array[Symbol.iterator]();
      };
    }
    return Collection;
  });

  (function(definition) {
    Spark.CollectionProperty = definition();
    return Spark.CollectionProperty.definition = definition;
  })(function(dependencies) {
    var Collection, CollectionProperty, DynamicProperty;
    if (dependencies == null) {
      dependencies = {};
    }
    DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : Spark.DynamicProperty;
    Collection = dependencies.hasOwnProperty("Collection") ? dependencies.Collection : Spark.Collection;
    CollectionProperty = (function(superClass) {
      extend(CollectionProperty, superClass);

      function CollectionProperty() {
        return CollectionProperty.__super__.constructor.apply(this, arguments);
      }

      CollectionProperty.prototype.ingest = function(val) {
        if (typeof this.property.options.ingest === 'function') {
          val = this.callOptionFunct("ingest", val);
        }
        if (val == null) {
          return [];
        } else if (typeof val.toArray === 'function') {
          return val.toArray();
        } else if (Array.isArray(val)) {
          return val.slice();
        } else {
          return [val];
        }
      };

      CollectionProperty.prototype.output = function() {
        var col, prop, value;
        value = this.value;
        if (typeof this.property.options.output === 'function') {
          value = this.callOptionFunct("output", this.value);
        }
        prop = this;
        col = Collection.newSubClass(this.property.options.collection, value);
        col.changed = function(old) {
          return prop.changed(old);
        };
        return col;
      };

      CollectionProperty.prototype.callChangedFunctions = function(old) {
        if (typeof this.property.options.itemAdded === 'function') {
          this.value.forEach((function(_this) {
            return function(item, i) {
              if (!old.includes(item)) {
                return _this.callOptionFunct("itemAdded", item, i);
              }
            };
          })(this));
        }
        if (typeof this.property.options.itemRemoved === 'function') {
          old.forEach((function(_this) {
            return function(item, i) {
              if (!_this.value.includes(item)) {
                return _this.callOptionFunct("itemRemoved", item, i);
              }
            };
          })(this));
        }
        return CollectionProperty.__super__.callChangedFunctions.call(this, old);
      };

      CollectionProperty.prototype.hasChangedFunctions = function() {
        return CollectionProperty.__super__.hasChangedFunctions.call(this) || typeof this.property.options.itemAdded === 'function' || typeof this.property.options.itemRemoved === 'function';
      };

      CollectionProperty.compose = function(prop) {
        if (prop.options.collection != null) {
          return prop.instanceType = (function(superClass1) {
            extend(_Class, superClass1);

            function _Class() {
              return _Class.__super__.constructor.apply(this, arguments);
            }

            return _Class;

          })(CollectionProperty);
        }
      };

      return CollectionProperty;

    })(DynamicProperty);
    return CollectionProperty;
  });

  (function(definition) {
    Spark.ComposedProperty = definition();
    return Spark.ComposedProperty.definition = definition;
  })(function(dependencies) {
    var CalculatedProperty, Collection, ComposedProperty, Invalidator;
    if (dependencies == null) {
      dependencies = {};
    }
    CalculatedProperty = dependencies.hasOwnProperty("CalculatedProperty") ? dependencies.CalculatedProperty : Spark.CalculatedProperty;
    Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : Spark.Invalidator;
    Collection = dependencies.hasOwnProperty("Collection") ? dependencies.Collection : Spark.Collection;
    ComposedProperty = (function(superClass) {
      extend(ComposedProperty, superClass);

      function ComposedProperty() {
        return ComposedProperty.__super__.constructor.apply(this, arguments);
      }

      ComposedProperty.prototype.init = function() {
        ComposedProperty.__super__.init.call(this);
        return this.initComposed();
      };

      ComposedProperty.prototype.initComposed = function() {
        if (this.property.options.hasOwnProperty('default')) {
          this["default"] = this.property.options["default"];
        } else {
          this["default"] = this.value = true;
        }
        this.members = new ComposedProperty.Members(this.property.options.members);
        this.members.changed = (function(_this) {
          return function(old) {
            return _this.invalidate();
          };
        })(this);
        return this.join = typeof this.property.options.composed === 'function' ? this.property.options.composed : this.property.options["default"] === false ? ComposedProperty.joinFunctions.or : ComposedProperty.joinFunctions.and;
      };

      ComposedProperty.prototype.calcul = function() {
        if (!this.invalidator) {
          this.invalidator = new Invalidator(this, this.obj);
        }
        this.invalidator.recycle((function(_this) {
          return function(invalidator, done) {
            _this.value = _this.members.reduce(function(prev, member) {
              var val;
              val = typeof member === 'function' ? member(_this.invalidator) : member;
              return _this.join(prev, val);
            }, _this["default"]);
            done();
            if (invalidator.isEmpty()) {
              return _this.invalidator = null;
            } else {
              return invalidator.bind();
            }
          };
        })(this));
        this.revalidated();
        return this.value;
      };

      ComposedProperty.compose = function(prop) {
        if (prop.options.composed != null) {
          prop.instanceType = (function(superClass1) {
            extend(_Class, superClass1);

            function _Class() {
              return _Class.__super__.constructor.apply(this, arguments);
            }

            return _Class;

          })(ComposedProperty);
          return prop.instanceType.prototype.get = this.prototype.calculatedGet;
        }
      };

      ComposedProperty.bind = function(target, prop) {
        CalculatedProperty.bind(target, prop);
        return Object.defineProperty(target, prop.name + 'Members', {
          configurable: true,
          get: function() {
            return prop.getInstance(this).members;
          }
        });
      };

      ComposedProperty.joinFunctions = {
        and: function(a, b) {
          return a && b;
        },
        or: function(a, b) {
          return a || b;
        }
      };

      return ComposedProperty;

    })(CalculatedProperty);
    ComposedProperty.Members = (function(superClass) {
      extend(Members, superClass);

      function Members() {
        return Members.__super__.constructor.apply(this, arguments);
      }

      Members.prototype.addPropertyRef = function(name, obj) {
        var fn;
        if (this.findRefIndex(name, obj) === -1) {
          fn = function(invalidator) {
            return invalidator.prop(name, obj);
          };
          fn.ref = {
            name: name,
            obj: obj
          };
          return this.push(fn);
        }
      };

      Members.prototype.addValueRef = function(val, name, obj) {
        var fn;
        if (this.findRefIndex(name, obj) === -1) {
          fn = function(invalidator) {
            return val;
          };
          fn.ref = {
            name: name,
            obj: obj
          };
          return this.push(fn);
        }
      };

      Members.prototype.addFunctionRef = function(fn, name, obj) {
        if (this.findRefIndex(name, obj) === -1) {
          fn.ref = {
            name: name,
            obj: obj
          };
          return this.push(fn);
        }
      };

      Members.prototype.findRefIndex = function(name, obj) {
        return this._array.findIndex(function(member) {
          return (member.ref != null) && member.ref.obj === obj && member.ref.name === name;
        });
      };

      Members.prototype.removeRef = function(name, obj) {
        var index, old;
        index = this.findRefIndex(name, obj);
        if (index !== -1) {
          old = this.toArray();
          this._array.splice(index, 1);
          return this.changed(old);
        }
      };

      return Members;

    })(Collection);
    return ComposedProperty;
  });

  (function(definition) {
    Spark.Property = definition();
    return Spark.Property.definition = definition;
  })(function(dependencies) {
    var ActivableProperty, CalculatedProperty, CollectionProperty, ComposedProperty, DynamicProperty, Property, PropertyInstance;
    if (dependencies == null) {
      dependencies = {};
    }
    PropertyInstance = dependencies.hasOwnProperty("PropertyInstance") ? dependencies.PropertyInstance : Spark.PropertyInstance;
    CollectionProperty = dependencies.hasOwnProperty("CollectionProperty") ? dependencies.CollectionProperty : Spark.CollectionProperty;
    ComposedProperty = dependencies.hasOwnProperty("ComposedProperty") ? dependencies.ComposedProperty : Spark.ComposedProperty;
    DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : Spark.DynamicProperty;
    CalculatedProperty = dependencies.hasOwnProperty("CalculatedProperty") ? dependencies.CalculatedProperty : Spark.CalculatedProperty;
    ActivableProperty = dependencies.hasOwnProperty("ActivableProperty") ? dependencies.ActivableProperty : Spark.ActivableProperty;
    Property = (function() {
      Property.prototype.composers = [ComposedProperty, CollectionProperty, DynamicProperty, PropertyInstance, CalculatedProperty, ActivableProperty];

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
          this.composers.forEach((function(_this) {
            return function(composer) {
              return composer.compose(_this);
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
    return Property;
  });

  (function(definition) {
    Spark.Element = definition();
    return Spark.Element.definition = definition;
  })(function(dependencies) {
    var Element, Property;
    if (dependencies == null) {
      dependencies = {};
    }
    Property = dependencies.hasOwnProperty("Property") ? dependencies.Property : Spark.Property;
    Element = (function() {
      function Element() {}

      Element.elementKeywords = ['extended', 'included', '__super__', 'constructor'];

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
              _this[name].apply(_this, args);
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
        if (obj.prototype != null) {
          this.include(obj.prototype);
        }
        if ((ref = obj.extended) != null) {
          ref.apply(this);
        }
        return this;
      };

      Element.getIncludableProperties = function(obj) {
        var exclude, props;
        exclude = Element.elementKeywords;
        if (obj._properties != null) {
          exclude = exclude.concat(obj._properties.map(function(prop) {
            return prop.name;
          }));
          exclude.push("_properties");
        }
        props = [];
        while (true) {
          props = props.concat(Object.getOwnPropertyNames(obj).filter((function(_this) {
            return function(key) {
              return !_this.prototype.hasOwnProperty(key) && key.substr(0, 2) !== "__" && indexOf.call(exclude, key) < 0 && indexOf.call(props, key) < 0;
            };
          })(this)));
          if (!((obj = Object.getPrototypeOf(obj)) && obj !== Object && obj !== Element.prototype)) {
            break;
          }
        }
        return props;
      };

      Element.include = function(obj) {
        var j, k, key, len, len1, property, ref, ref1, ref2;
        ref = this.getIncludableProperties(obj);
        for (j = 0, len = ref.length; j < len; j++) {
          key = ref[j];
          this.prototype[key] = obj[key];
        }
        if (obj._properties != null) {
          ref1 = obj._properties;
          for (k = 0, len1 = ref1.length; k < len1; k++) {
            property = ref1[k];
            this.property(property.name, Object.assign({}, property.options));
          }
        }
        if ((ref2 = obj.included) != null) {
          ref2.apply(this);
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
    return Element;
  });

  (function(definition) {
    Spark.Updater = definition();
    return Spark.Updater.definition = definition;
  })(function(dependencies) {
    var Binder, Updater;
    if (dependencies == null) {
      dependencies = {};
    }
    Binder = dependencies.hasOwnProperty("Binder") ? dependencies.Binder : Spark.Binder;
    Updater = (function() {
      function Updater() {
        this.callbacks = [];
        this.next = [];
        this.updating = false;
      }

      Updater.prototype.update = function() {
        var callback;
        this.updating = true;
        this.next = this.callbacks.slice();
        while (this.callbacks.length > 0) {
          callback = this.callbacks.shift();
          callback();
        }
        this.callbacks = this.next;
        this.updating = false;
        return this;
      };

      Updater.prototype.addCallback = function(callback) {
        if (!this.callbacks.includes(callback)) {
          this.callbacks.push(callback);
        }
        if (this.updating && !this.next.includes(callback)) {
          return this.next.push(callback);
        }
      };

      Updater.prototype.nextTick = function(callback) {
        if (this.updating) {
          if (!this.next.includes(callback)) {
            return this.next.push(callback);
          }
        } else {
          return this.addCallback(callback);
        }
      };

      Updater.prototype.removeCallback = function(callback) {
        var index;
        index = this.callbacks.indexOf(callback);
        if (index !== -1) {
          this.callbacks.splice(index, 1);
        }
        index = this.next.indexOf(callback);
        if (index !== -1) {
          return this.next.splice(index, 1);
        }
      };

      Updater.prototype.getBinder = function() {
        return new Updater.Binder(this);
      };

      Updater.prototype.destroy = function() {
        this.callbacks = [];
        return this.next = [];
      };

      return Updater;

    })();
    Updater.Binder = (function(superClass) {
      extend(Binder, superClass);

      function Binder() {
        return Binder.__super__.constructor.apply(this, arguments);
      }

      Binder.prototype.doBind = function() {
        return this.target.addCallback(this.callback);
      };

      Binder.prototype.doUnbind = function() {
        return this.target.removeCallback(this.callback);
      };

      return Binder;

    })(Binder);
    return Updater;
  });

}).call(this);
