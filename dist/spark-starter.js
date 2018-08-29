(function() {
  var Spark,
    indexOf = [].indexOf;

  Spark = typeof module !== "undefined" && module !== null ? module.exports = {} : (this.Spark == null ? this.Spark = {} : void 0, this.Spark);

  (function(definition) {
    Spark.Binder = definition();
    return Spark.Binder.definition = definition;
  })(function() {
    var Binder;
    Binder = class Binder {
      bind() {
        if (!this.binded && (this.callback != null) && (this.target != null)) {
          this.doBind();
        }
        return this.binded = true;
      }

      doBind() {
        throw new Error('Not implemented');
      }

      unbind() {
        if (this.binded && (this.callback != null) && (this.target != null)) {
          this.doUnbind();
        }
        return this.binded = false;
      }

      doUnbind() {
        throw new Error('Not implemented');
      }

      equals(binder) {
        return this.constructor.compareRefered(binder, this);
      }

      static compareRefered(obj1, obj2) {
        return obj1 === obj2 || ((obj1 != null) && (obj2 != null) && obj1.constructor === obj2.constructor && this.compareRef(obj1.ref, obj2.ref));
      }

      static compareRef(ref1, ref2) {
        return (ref1 != null) && (ref2 != null) && (ref1 === ref2 || (Array.isArray(ref1) && Array.isArray(ref1) && ref1.every((val, i) => {
          return this.compareRefered(ref1[i], ref2[i]);
        })) || (typeof ref1 === "object" && typeof ref2 === "object" && Object.keys(ref1).join() === Object.keys(ref2).join() && Object.keys(ref1).every((key) => {
          return this.compareRefered(ref1[key], ref2[key]);
        })));
      }

    };
    return Binder;
  });

  (function(definition) {
    Spark.Collection = definition();
    return Spark.Collection.definition = definition;
  })(function() {
    var Collection;
    Collection = (function() {
      class Collection {
        constructor(arr) {
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

        changed() {}

        checkChanges(old, ordered = true, compareFunction = null) {
          if (compareFunction == null) {
            compareFunction = function(a, b) {
              return a === b;
            };
          }
          old = this.copy(old.slice());
          return this.count() !== old.length || (ordered ? this.some(function(val, i) {
            return !compareFunction(old.get(i), val);
          }) : this.some(function(a) {
            return !old.pluck(function(b) {
              return compareFunction(a, b);
            });
          }));
        }

        get(i) {
          return this._array[i];
        }

        set(i, val) {
          var old;
          if (this._array[i] !== val) {
            old = this.toArray();
            this._array[i] = val;
            this.changed(old);
          }
          return val;
        }

        add(val) {
          if (!this._array.includes(val)) {
            return this.push(val);
          }
        }

        remove(val) {
          var index, old;
          index = this._array.indexOf(val);
          if (index !== -1) {
            old = this.toArray();
            this._array.splice(index, 1);
            return this.changed(old);
          }
        }

        pluck(fn) {
          var found, index, old;
          index = this._array.findIndex(fn);
          if (index > -1) {
            old = this.toArray();
            found = this._array[index];
            this._array.splice(index, 1);
            this.changed(old);
            return found;
          } else {
            return null;
          }
        }

        toArray() {
          return this._array.slice();
        }

        count() {
          return this._array.length;
        }

        static newSubClass(fn, arr) {
          var SubClass;
          if (typeof fn === 'object') {
            SubClass = class extends this {};
            Object.assign(SubClass.prototype, fn);
            return new SubClass(arr);
          } else {
            return new this(arr);
          }
        }

        copy(arr) {
          var coll;
          if (arr == null) {
            arr = this.toArray();
          }
          coll = new this.constructor(arr);
          return coll;
        }

        equals(arr) {
          return (this.count() === (typeof arr.count === 'function' ? arr.count() : arr.length)) && this.every(function(val, i) {
            return arr[i] === val;
          });
        }

        getAddedFrom(arr) {
          return this._array.filter(function(item) {
            return !arr.includes(item);
          });
        }

        getRemovedFrom(arr) {
          return arr.filter((item) => {
            return !this.includes(item);
          });
        }

      };

      Collection.readFunctions = ['every', 'find', 'findIndex', 'forEach', 'includes', 'indexOf', 'join', 'lastIndexOf', 'map', 'reduce', 'reduceRight', 'some', 'toString'];

      Collection.readListFunctions = ['concat', 'filter', 'slice'];

      Collection.writefunctions = ['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'];

      Collection.readFunctions.forEach(function(funct) {
        return Collection.prototype[funct] = function(...arg) {
          return this._array[funct](...arg);
        };
      });

      Collection.readListFunctions.forEach(function(funct) {
        return Collection.prototype[funct] = function(...arg) {
          return this.copy(this._array[funct](...arg));
        };
      });

      Collection.writefunctions.forEach(function(funct) {
        return Collection.prototype[funct] = function(...arg) {
          var old, res;
          old = this.toArray();
          res = this._array[funct](...arg);
          this.changed(old);
          return res;
        };
      });

      return Collection;

    }).call(this);
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
    Spark.Mixable = definition();
    return Spark.Mixable.definition = definition;
  })(function() {
    var Mixable;
    Mixable = (function() {
      class Mixable {
        static extend(obj) {
          this.Extension.make(obj, this);
          if (obj.prototype != null) {
            return this.Extension.make(obj.prototype, this.prototype);
          }
        }

        static include(obj) {
          return this.Extension.make(obj, this.prototype);
        }

      };

      Mixable.Extension = {
        make: function(source, target) {
          var j, key, len, ref3;
          ref3 = this.getExtensionProperties(source, target);
          for (j = 0, len = ref3.length; j < len; j++) {
            key = ref3[j];
            target[key] = source[key];
          }
          target.extensions = (target.extensions || []).concat([source]);
          if (typeof source.extended === 'function') {
            return source.extended(target);
          }
        },
        alwaysFinal: ['extended', 'extensions', '__super__', 'constructor'],
        getExtensionProperties: function(source, target) {
          var alwaysFinal, props, targetChain;
          alwaysFinal = this.alwaysFinal;
          targetChain = this.getPrototypeChain(target);
          props = [];
          this.getPrototypeChain(source).every(function(obj) {
            var exclude;
            if (!targetChain.includes(obj)) {
              exclude = alwaysFinal;
              if (source.getFinalProperties != null) {
                exclude = exclude.concat(source.getFinalProperties());
              }
              if (typeof obj === 'function') {
                exclude = exclude.concat(["length", "prototype", "name"]);
              }
              props = props.concat(Object.getOwnPropertyNames(obj).filter((key) => {
                return !target.hasOwnProperty(key) && key.substr(0, 2) !== "__" && indexOf.call(exclude, key) < 0;
              }));
              return true;
            }
          });
          return props;
        },
        getPrototypeChain: function(obj) {
          var basePrototype, chain;
          chain = [];
          basePrototype = Object.getPrototypeOf(Object);
          while (true) {
            chain.push(obj);
            if (!((obj = Object.getPrototypeOf(obj)) && obj !== Object && obj !== basePrototype)) {
              break;
            }
          }
          return chain;
        }
      };

      return Mixable;

    }).call(this);
    return Mixable;
  });

  (function(definition) {
    Spark.BasicProperty = definition();
    return Spark.BasicProperty.definition = definition;
  })(function() {
    var BasicProperty;
    BasicProperty = class BasicProperty {
      constructor(property1, obj3) {
        this.property = property1;
        this.obj = obj3;
        this.init();
      }

      init() {
        this.value = this.ingest(this.default);
        return this.calculated = false;
      }

      get() {
        this.calculated = true;
        return this.output();
      }

      set(val) {
        return this.setAndCheckChanges(val);
      }

      callbackSet(val) {
        this.callOptionFunct("set", val);
        return this;
      }

      setAndCheckChanges(val) {
        var old;
        val = this.ingest(val);
        this.revalidated();
        if (this.checkChanges(val, this.value)) {
          old = this.value;
          this.value = val;
          this.manual = true;
          this.changed(old);
        }
        return this;
      }

      checkChanges(val, old) {
        return val !== old;
      }

      destroy() {}

      callOptionFunct(funct, ...args) {
        if (typeof funct === 'string') {
          funct = this.property.options[funct];
        }
        if (typeof funct.overrided === 'function') {
          args.push((...args) => {
            return this.callOptionFunct(funct.overrided, ...args);
          });
        }
        return funct.apply(this.obj, args);
      }

      revalidated() {
        this.calculated = true;
        return this.initiated = true;
      }

      ingest(val) {
        if (typeof this.property.options.ingest === 'function') {
          return val = this.callOptionFunct("ingest", val);
        } else {
          return val;
        }
      }

      output() {
        if (typeof this.property.options.output === 'function') {
          return this.callOptionFunct("output", this.value);
        } else {
          return this.value;
        }
      }

      changed(old) {
        this.callChangedFunctions(old);
        if (typeof this.obj.emitEvent === 'function') {
          this.obj.emitEvent(this.updateEventName, [old]);
          this.obj.emitEvent(this.changeEventName, [old]);
        }
        return this;
      }

      callChangedFunctions(old) {
        if (typeof this.property.options.change === 'function') {
          return this.callOptionFunct("change", old);
        }
      }

      hasChangedFunctions() {
        return typeof this.property.options.change === 'function';
      }

      hasChangedEvents() {
        return typeof this.obj.getListeners === 'function' && this.obj.getListeners(this.changeEventName).length > 0;
      }

      static compose(prop) {
        if (prop.instanceType == null) {
          prop.instanceType = class extends BasicProperty {};
        }
        if (typeof prop.options.set === 'function') {
          prop.instanceType.prototype.set = this.prototype.callbackSet;
        } else {
          prop.instanceType.prototype.set = this.prototype.setAndCheckChanges;
        }
        prop.instanceType.prototype.default = prop.options.default;
        prop.instanceType.prototype.initiated = typeof prop.options.default !== 'undefined';
        return this.setEventNames(prop);
      }

      static setEventNames(prop) {
        prop.instanceType.prototype.changeEventName = prop.options.changeEventName || prop.name + 'Changed';
        prop.instanceType.prototype.updateEventName = prop.options.updateEventName || prop.name + 'Updated';
        return prop.instanceType.prototype.invalidateEventName = prop.options.invalidateEventName || prop.name + 'Invalidated';
      }

      static bind(target, prop) {
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
      }

    };
    return BasicProperty;
  });

  (function(definition) {
    Spark.PropertyOwner = definition();
    return Spark.PropertyOwner.definition = definition;
  })(function() {
    var PropertyOwner;
    PropertyOwner = class PropertyOwner {
      getProperty(name) {
        return this._properties && this._properties.find(function(prop) {
          return prop.name === name;
        });
      }

      getPropertyInstance(name) {
        var res;
        res = this.getProperty(name);
        if (res) {
          return res.getInstance(this);
        }
      }

      getProperties() {
        return this._properties.slice();
      }

      getPropertyInstances() {
        return this._properties.map((prop) => {
          return prop.getInstance(this);
        });
      }

      getInstantiatedProperties() {
        return this._properties.filter((prop) => {
          return prop.isInstantiated(this);
        }).map((prop) => {
          return prop.getInstance(this);
        });
      }

      getManualDataProperties() {
        return this._properties.reduce((res, prop) => {
          var instance;
          if (prop.isInstantiated(this)) {
            instance = prop.getInstance(this);
            if (instance.calculated && instance.manual) {
              res[prop.name] = instance.value;
            }
          }
          return res;
        }, {});
      }

      setProperties(data, options = {}) {
        var key, prop, val;
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
      }

      destroyProperties() {
        this.getInstantiatedProperties().forEach((prop) => {
          return prop.destroy();
        });
        this._properties = [];
        return true;
      }

      listenerAdded(event, listener) {
        return this._properties.forEach((prop) => {
          if (prop.getInstanceType().prototype.changeEventName === event) {
            return prop.getInstance(this).get();
          }
        });
      }

      extended(target) {
        return target.listenerAdded = this.listenerAdded;
      }

    };
    return PropertyOwner;
  });

  (function(definition) {
    Spark.DynamicProperty = definition();
    return Spark.DynamicProperty.definition = definition;
  })(function(dependencies = {}) {
    var BasicProperty, DynamicProperty, Invalidator;
    Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : Spark.Invalidator;
    BasicProperty = dependencies.hasOwnProperty("BasicProperty") ? dependencies.BasicProperty : Spark.BasicProperty;
    DynamicProperty = class DynamicProperty extends BasicProperty {
      init() {
        super.init();
        return this.initRevalidate();
      }

      initRevalidate() {
        return this.revalidateCallback = () => {
          return this.get();
        };
      }

      callbackGet() {
        var res;
        res = this.callOptionFunct("get");
        this.revalidated();
        return res;
      }

      invalidate() {
        if (this.calculated || this.active === false) {
          this.calculated = false;
          this._invalidateNotice();
        }
        return this;
      }

      revalidate() {
        super.revalidate();
        return this.revalidateUpdater();
      }

      revalidateUpdater() {
        if (this.getUpdater() != null) {
          return this.getUpdater().unbind();
        }
      }

      _invalidateNotice() {
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
      }

      getUpdater() {
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
      }

      isImmediate() {
        return this.property.options.immediate !== false && (this.property.options.immediate === true || (typeof this.property.options.immediate === 'function' ? this.callOptionFunct("immediate") : (this.getUpdater() == null) && (this.hasChangedEvents() || this.hasChangedFunctions())));
      }

      static compose(prop) {
        if (typeof prop.options.get === 'function' || typeof prop.options.calcul === 'function' || typeof prop.options.active === 'function') {
          if (prop.instanceType == null) {
            prop.instanceType = class extends DynamicProperty {};
          }
        }
        
        // if prop.instanceType? and prop.instanceType.prototype instanceof DynamicProperty
        if (typeof prop.options.get === 'function') {
          return prop.instanceType.prototype.get = this.prototype.callbackGet;
        }
      }

    };
    return DynamicProperty;
  });

  (function(definition) {
    Spark.CalculatedProperty = definition();
    return Spark.CalculatedProperty.definition = definition;
  })(function(dependencies = {}) {
    var CalculatedProperty, DynamicProperty, Invalidator;
    Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : Spark.Invalidator;
    DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : Spark.DynamicProperty;
    CalculatedProperty = class CalculatedProperty extends DynamicProperty {
      calculatedGet() {
        var initiated, old;
        if (this.invalidator) {
          this.invalidator.validateUnknowns();
        }
        if (!this.calculated) {
          old = this.value;
          initiated = this.initiated;
          this.calcul();
          if (this.checkChanges(this.value, old)) {
            if (initiated) {
              this.changed(old);
            } else if (typeof this.obj.emitEvent === 'function') {
              this.obj.emitEvent(this.updateEventName, [old]);
            }
          }
        }
        return this.output();
      }

      calcul() {
        this.revalidated();
        return this.value;
      }

      callbackCalcul() {
        this.value = this.callOptionFunct(this.calculFunct);
        this.manual = false;
        this.revalidated();
        return this.value;
      }

      invalidatedCalcul() {
        if (!this.invalidator) {
          this.invalidator = new Invalidator(this, this.obj);
        }
        this.invalidator.recycle((invalidator, done) => {
          this.value = this.callOptionFunct(this.calculFunct, invalidator);
          this.manual = false;
          done();
          if (invalidator.isEmpty()) {
            return this.invalidator = null;
          } else {
            return invalidator.bind();
          }
        });
        this.revalidated();
        return this.value;
      }

      unknown() {
        if (this.calculated || this.active === false) {
          this._invalidateNotice();
        }
        return this;
      }

      destroyWhithoutInvalidator() {
        return this.destroy();
      }

      destroyInvalidator() {
        this.destroyWhithoutInvalidator();
        if (this.invalidator != null) {
          return this.invalidator.unbind();
        }
      }

      invalidateInvalidator() {
        if (this.calculated || this.active === false) {
          this.calculated = false;
          if (this._invalidateNotice() && (this.invalidator != null)) {
            this.invalidator.unbind();
          }
        }
        return this;
      }

      static compose(prop) {
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
      }

    };
    return CalculatedProperty;
  });

  (function(definition) {
    Spark.Invalidator = definition();
    return Spark.Invalidator.definition = definition;
  })(function(dependencies = {}) {
    var Binder, EventBind, Invalidator, pluck;
    Binder = dependencies.hasOwnProperty("Binder") ? dependencies.Binder : Spark.Binder;
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
      class Invalidator extends Binder {
        constructor(property1, obj3 = null) {
          super();
          this.property = property1;
          this.obj = obj3;
          this.invalidationEvents = [];
          this.recycled = [];
          this.unknowns = [];
          this.strict = this.constructor.strict;
          this.invalidated = false;
          this.invalidateCallback = () => {
            this.invalidate();
            return null;
          };
        }

        invalidate() {
          var functName;
          this.invalidated = true;
          if (typeof this.property === "function") {
            return this.property();
          } else if (typeof this.callback === "function") {
            return this.callback();
          } else if ((this.property != null) && typeof this.property.invalidate === "function") {
            return this.property.invalidate();
          } else if (typeof this.property === "string") {
            functName = 'invalidate' + this.property.charAt(0).toUpperCase() + this.property.slice(1);
            if (typeof this.obj[functName] === "function") {
              return this.obj[functName]();
            } else {
              return this.obj[this.property] = null;
            }
          }
        }

        unknown() {
          if (typeof this.property.unknown === "function") {
            return this.property.unknown();
          } else {
            return this.invalidate();
          }
        }

        addEventBind(event, target, callback) {
          return this.addBinder(new EventBind(event, target, callback));
        }

        addBinder(binder) {
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
        }

        getUnknownCallback(prop, target) {
          var callback;
          callback = () => {
            return this.addUnknown(function() {
              return target[prop];
            }, prop, target);
          };
          callback.ref = {
            prop: prop,
            target: target
          };
          return callback;
        }

        addUnknown(fn, prop, target) {
          if (!this.findUnknown(prop, target)) {
            fn.ref = {
              "prop": prop,
              "target": target
            };
            this.unknowns.push(fn);
            return this.unknown();
          }
        }

        findUnknown(prop, target) {
          if ((prop != null) || (target != null)) {
            return this.unknowns.find(function(unknown) {
              return unknown.ref.prop === prop && unknown.ref.target === target;
            });
          }
        }

        event(event, target = this.obj) {
          if (this.checkEmitter(target)) {
            return this.addEventBind(event, target);
          }
        }

        value(val, event, target = this.obj) {
          this.event(event, target);
          return val;
        }

        prop(prop, target = this.obj) {
          if (typeof prop !== 'string') {
            throw new Error('Property name must be a string');
          }
          if (this.checkEmitter(target)) {
            this.addEventBind(prop + 'Invalidated', target, this.getUnknownCallback(prop, target));
            return this.value(target[prop], prop + 'Updated', target);
          } else {
            return target[prop];
          }
        }

        propInitiated(prop, target = this.obj) {
          var initiated;
          initiated = target.getPropertyInstance(prop).initiated;
          if (!initiated && this.checkEmitter(target)) {
            this.event(prop + 'Updated', target);
          }
          return initiated;
        }

        funct(funct) {
          var invalidator, res;
          invalidator = new Invalidator(() => {
            return this.addUnknown(() => {
              var res2;
              res2 = funct(invalidator);
              if (res !== res2) {
                return this.invalidate();
              }
            }, invalidator);
          });
          res = funct(invalidator);
          this.invalidationEvents.push(invalidator);
          return res;
        }

        validateUnknowns(prop, target = this.obj) {
          var unknowns;
          unknowns = this.unknowns;
          this.unknowns = [];
          return unknowns.forEach(function(unknown) {
            return unknown();
          });
        }

        isEmpty() {
          return this.invalidationEvents.length === 0;
        }

        bind() {
          this.invalidated = false;
          return this.invalidationEvents.forEach(function(eventBind) {
            return eventBind.bind();
          });
        }

        recycle(callback) {
          var done, res;
          this.recycled = this.invalidationEvents;
          this.invalidationEvents = [];
          done = () => {
            this.recycled.forEach(function(eventBind) {
              return eventBind.unbind();
            });
            return this.recycled = [];
          };
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
        }

        checkEmitter(emitter) {
          return EventBind.checkEmitter(emitter, this.strict);
        }

        unbind() {
          return this.invalidationEvents.forEach(function(eventBind) {
            return eventBind.unbind();
          });
        }

      };

      Invalidator.strict = true;

      return Invalidator;

    }).call(this);
    return Invalidator;
  });

  (function(definition) {
    Spark.CollectionProperty = definition();
    return Spark.CollectionProperty.definition = definition;
  })(function(dependencies = {}) {
    var Collection, CollectionProperty, DynamicProperty;
    DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : Spark.DynamicProperty;
    Collection = dependencies.hasOwnProperty("Collection") ? dependencies.Collection : Spark.Collection;
    CollectionProperty = (function() {
      class CollectionProperty extends DynamicProperty {
        ingest(val) {
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
        }

        checkChangedItems(val, old) {
          var compareFunction;
          if (typeof this.collectionOptions.compare === 'function') {
            compareFunction = this.collectionOptions.compare;
          }
          return (new Collection(val)).checkChanges(old, this.collectionOptions.ordered, compareFunction);
        }

        output() {
          var col, prop, value;
          value = this.value;
          if (typeof this.property.options.output === 'function') {
            value = this.callOptionFunct("output", this.value);
          }
          prop = this;
          col = Collection.newSubClass(this.collectionOptions, value);
          col.changed = function(old) {
            return prop.changed(old);
          };
          return col;
        }

        callChangedFunctions(old) {
          if (typeof this.property.options.itemAdded === 'function') {
            this.value.forEach((item, i) => {
              if (!old.includes(item)) {
                return this.callOptionFunct("itemAdded", item, i);
              }
            });
          }
          if (typeof this.property.options.itemRemoved === 'function') {
            old.forEach((item, i) => {
              if (!this.value.includes(item)) {
                return this.callOptionFunct("itemRemoved", item, i);
              }
            });
          }
          return super.callChangedFunctions(old);
        }

        hasChangedFunctions() {
          return super.hasChangedFunctions() || typeof this.property.options.itemAdded === 'function' || typeof this.property.options.itemRemoved === 'function';
        }

        static compose(prop) {
          if (prop.options.collection != null) {
            prop.instanceType = class extends CollectionProperty {};
            prop.instanceType.prototype.collectionOptions = Object.assign({}, this.defaultCollectionOptions, typeof prop.options.collection === 'object' ? prop.options.collection : {});
            if (prop.options.collection.compare != null) {
              return prop.instanceType.prototype.checkChanges = this.prototype.checkChangedItems;
            }
          }
        }

      };

      CollectionProperty.defaultCollectionOptions = {
        compare: false,
        ordered: true
      };

      return CollectionProperty;

    }).call(this);
    return CollectionProperty;
  });

  (function(definition) {
    Spark.ActivableProperty = definition();
    return Spark.ActivableProperty.definition = definition;
  })(function(dependencies = {}) {
    var ActivableProperty, BasicProperty, Invalidator;
    Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : Spark.Invalidator;
    BasicProperty = dependencies.hasOwnProperty("BasicProperty") ? dependencies.BasicProperty : Spark.BasicProperty;
    ActivableProperty = class ActivableProperty extends BasicProperty {
      activableGet() {
        return this.get();
      }

      activableGet() {
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
      }

      isActive() {
        return true;
      }

      manualActive() {
        return this.active;
      }

      callbackActive() {
        var invalidator;
        invalidator = this.activeInvalidator || new Invalidator(this, this.obj);
        invalidator.recycle((invalidator, done) => {
          this.active = this.callOptionFunct(this.activeFunct, invalidator);
          done();
          if (this.active || invalidator.isEmpty()) {
            invalidator.unbind();
            return this.activeInvalidator = null;
          } else {
            this.invalidator = invalidator;
            this.activeInvalidator = invalidator;
            return invalidator.bind();
          }
        });
        return this.active;
      }

      activeChanged(old) {
        return this.changed(old);
      }

      activableChanged(old) {
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
      }

      static compose(prop) {
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
      }

    };
    return ActivableProperty;
  });

  (function(definition) {
    Spark.EventBind = definition();
    return Spark.EventBind.definition = definition;
  })(function(dependencies = {}) {
    var Binder, EventBind;
    Binder = dependencies.hasOwnProperty("Binder") ? dependencies.Binder : Spark.Binder;
    EventBind = class EventBind extends Binder {
      constructor(event1, target1, callback1) {
        super();
        this.event = event1;
        this.target = target1;
        this.callback = callback1;
        this.ref = {
          event: this.event,
          target: this.target,
          callback: this.callback
        };
      }

      doBind() {
        if (typeof this.target.addEventListener === 'function') {
          return this.target.addEventListener(this.event, this.callback);
        } else if (typeof this.target.addListener === 'function') {
          return this.target.addListener(this.event, this.callback);
        } else if (typeof this.target.on === 'function') {
          return this.target.on(this.event, this.callback);
        } else {
          throw new Error('No function to add event listeners was found');
        }
      }

      doUnbind() {
        if (typeof this.target.removeEventListener === 'function') {
          return this.target.removeEventListener(this.event, this.callback);
        } else if (typeof this.target.removeListener === 'function') {
          return this.target.removeListener(this.event, this.callback);
        } else if (typeof this.target.off === 'function') {
          return this.target.off(this.event, this.callback);
        } else {
          throw new Error('No function to remove event listeners was found');
        }
      }

      equals(eventBind) {
        return super.equals(eventBind) && eventBind.event === this.event;
      }

      match(event, target) {
        return event === this.event && target === this.target;
      }

      static checkEmitter(emitter, fatal = true) {
        if (typeof emitter.addEventListener === 'function' || typeof emitter.addListener === 'function' || typeof emitter.on === 'function') {
          return true;
        } else if (fatal) {
          throw new Error('No function to add event listeners was found');
        } else {
          return false;
        }
      }

    };
    return EventBind;
  });

  (function(definition) {
    Spark.ComposedProperty = definition();
    return Spark.ComposedProperty.definition = definition;
  })(function(dependencies = {}) {
    var CalculatedProperty, Collection, ComposedProperty, Invalidator;
    CalculatedProperty = dependencies.hasOwnProperty("CalculatedProperty") ? dependencies.CalculatedProperty : Spark.CalculatedProperty;
    Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : Spark.Invalidator;
    Collection = dependencies.hasOwnProperty("Collection") ? dependencies.Collection : Spark.Collection;
    ComposedProperty = (function() {
      class ComposedProperty extends CalculatedProperty {
        init() {
          super.init();
          return this.initComposed();
        }

        initComposed() {
          if (this.property.options.hasOwnProperty('default')) {
            this.default = this.property.options.default;
          } else {
            this.default = this.value = true;
          }
          this.members = new ComposedProperty.Members(this.property.options.members);
          this.members.changed = (old) => {
            return this.invalidate();
          };
          return this.join = typeof this.property.options.composed === 'function' ? this.property.options.composed : this.property.options.default === false ? ComposedProperty.joinFunctions.or : ComposedProperty.joinFunctions.and;
        }

        calcul() {
          if (!this.invalidator) {
            this.invalidator = new Invalidator(this, this.obj);
          }
          this.invalidator.recycle((invalidator, done) => {
            this.value = this.members.reduce((prev, member) => {
              var val;
              val = typeof member === 'function' ? member(this.invalidator) : member;
              return this.join(prev, val);
            }, this.default);
            done();
            if (invalidator.isEmpty()) {
              return this.invalidator = null;
            } else {
              return invalidator.bind();
            }
          });
          this.revalidated();
          return this.value;
        }

        static compose(prop) {
          if (prop.options.composed != null) {
            prop.instanceType = class extends ComposedProperty {};
            return prop.instanceType.prototype.get = this.prototype.calculatedGet;
          }
        }

        static bind(target, prop) {
          CalculatedProperty.bind(target, prop);
          return Object.defineProperty(target, prop.name + 'Members', {
            configurable: true,
            get: function() {
              return prop.getInstance(this).members;
            }
          });
        }

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

    }).call(this);
    ComposedProperty.Members = class Members extends Collection {
      addPropertyRef(name, obj) {
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
      }

      addValueRef(val, name, obj) {
        var fn;
        if (this.findRefIndex(name, obj) === -1) {
          fn = function(invalidator) {
            return val;
          };
          fn.ref = {
            name: name,
            obj: obj,
            val: val
          };
          return this.push(fn);
        }
      }

      setValueRef(val, name, obj) {
        var fn, i, ref;
        i = this.findRefIndex(name, obj);
        if (i === -1) {
          return this.addValueRef(val, name, obj);
        } else if (this.get(i).ref.val !== val) {
          ref = {
            name: name,
            obj: obj,
            val: val
          };
          fn = function(invalidator) {
            return val;
          };
          fn.ref = ref;
          return this.set(i, fn);
        }
      }

      getValueRef(name, obj) {
        return this.findByRef(name, obj).ref.val;
      }

      addFunctionRef(fn, name, obj) {
        if (this.findRefIndex(name, obj) === -1) {
          fn.ref = {
            name: name,
            obj: obj
          };
          return this.push(fn);
        }
      }

      findByRef(name, obj) {
        return this._array[this.findRefIndex(name, obj)];
      }

      findRefIndex(name, obj) {
        return this._array.findIndex(function(member) {
          return (member.ref != null) && member.ref.obj === obj && member.ref.name === name;
        });
      }

      removeRef(name, obj) {
        var index, old;
        index = this.findRefIndex(name, obj);
        if (index !== -1) {
          old = this.toArray();
          this._array.splice(index, 1);
          return this.changed(old);
        }
      }

    };
    return ComposedProperty;
  });

  (function(definition) {
    Spark.Property = definition();
    return Spark.Property.definition = definition;
  })(function(dependencies = {}) {
    var ActivableProperty, BasicProperty, CalculatedProperty, CollectionProperty, ComposedProperty, DynamicProperty, Mixable, Property, PropertyOwner;
    BasicProperty = dependencies.hasOwnProperty("BasicProperty") ? dependencies.BasicProperty : Spark.BasicProperty;
    CollectionProperty = dependencies.hasOwnProperty("CollectionProperty") ? dependencies.CollectionProperty : Spark.CollectionProperty;
    ComposedProperty = dependencies.hasOwnProperty("ComposedProperty") ? dependencies.ComposedProperty : Spark.ComposedProperty;
    DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : Spark.DynamicProperty;
    CalculatedProperty = dependencies.hasOwnProperty("CalculatedProperty") ? dependencies.CalculatedProperty : Spark.CalculatedProperty;
    ActivableProperty = dependencies.hasOwnProperty("ActivableProperty") ? dependencies.ActivableProperty : Spark.ActivableProperty;
    PropertyOwner = dependencies.hasOwnProperty("PropertyOwner") ? dependencies.PropertyOwner : Spark.PropertyOwner;
    Mixable = dependencies.hasOwnProperty("Mixable") ? dependencies.Mixable : Spark.Mixable;
    Property = (function() {
      class Property {
        constructor(name1, options1 = {}) {
          this.name = name1;
          this.options = options1;
        }

        bind(target) {
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
            this.makeOwner(target);
          }
          return prop;
        }

        override(parent) {
          var key, ref3, results, value;
          if (this.options.parent == null) {
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
          }
        }

        makeOwner(target) {
          var ref3;
          if (!((ref3 = target.extensions) != null ? ref3.includes(PropertyOwner.prototype) : void 0)) {
            return Mixable.Extension.make(PropertyOwner.prototype, target);
          }
        }

        getInstanceVarName() {
          return this.options.instanceVarName || '_' + this.name;
        }

        isInstantiated(obj) {
          return obj[this.getInstanceVarName()] != null;
        }

        getInstance(obj) {
          var Type, varName;
          varName = this.getInstanceVarName();
          if (!this.isInstantiated(obj)) {
            Type = this.getInstanceType();
            obj[varName] = new Type(this, obj);
          }
          return obj[varName];
        }

        getInstanceType() {
          if (!this.instanceType) {
            this.composers.forEach((composer) => {
              return composer.compose(this);
            });
          }
          return this.instanceType;
        }

      };

      Property.prototype.composers = [ComposedProperty, CollectionProperty, DynamicProperty, BasicProperty, CalculatedProperty, ActivableProperty];

      return Property;

    }).call(this);
    return Property;
  });

  (function(definition) {
    Spark.Element = definition();
    return Spark.Element.definition = definition;
  })(function(dependencies = {}) {
    var Element, Mixable, Property;
    Property = dependencies.hasOwnProperty("Property") ? dependencies.Property : Spark.Property;
    Mixable = dependencies.hasOwnProperty("Mixable") ? dependencies.Mixable : Spark.Mixable;
    Element = class Element extends Mixable {
      tap(name) {
        var args;
        args = Array.prototype.slice.call(arguments);
        if (typeof name === 'function') {
          name.apply(this, args.slice(1));
        } else {
          this[name].apply(this, args.slice(1));
        }
        return this;
      }

      callback(name) {
        if (this._callbacks == null) {
          this._callbacks = {};
        }
        if (this._callbacks[name] != null) {
          return this._callbacks[name];
        } else {
          return this._callbacks[name] = (...args) => {
            this[name].apply(this, args);
            return null;
          };
        }
      }

      getFinalProperties() {
        if (this._properties != null) {
          return ['_properties'].concat(this._properties.map(function(prop) {
            return prop.name;
          }));
        } else {
          return [];
        }
      }

      extended(target) {
        var j, len, options, property, ref3, results;
        if (this._properties != null) {
          ref3 = this._properties;
          results = [];
          for (j = 0, len = ref3.length; j < len; j++) {
            property = ref3[j];
            options = Object.assign({}, property.options);
            results.push((new Property(property.name, options)).bind(target));
          }
          return results;
        }
      }

      static property(prop, desc) {
        return (new Property(prop, desc)).bind(this.prototype);
      }

      static properties(properties) {
        var desc, prop, results;
        results = [];
        for (prop in properties) {
          desc = properties[prop];
          results.push(this.property(prop, desc));
        }
        return results;
      }

    };
    return Element;
  });

  (function(definition) {
    Spark.EventEmitter = definition();
    return Spark.EventEmitter.definition = definition;
  })(function() {
    var EventEmitter;
    EventEmitter = (function() {
      class EventEmitter {
        getAllEvents() {
          return this._events || (this._events = {});
        }

        getListeners(e) {
          var events;
          events = this.getAllEvents();
          return events[e] || (events[e] = []);
        }

        hasListener(e, listener) {
          return this.getListeners(e).includes(listener);
        }

        addListener(e, listener) {
          if (!this.hasListener(e, listener)) {
            this.getListeners(e).push(listener);
            return this.listenerAdded(e, listener);
          }
        }

        listenerAdded(e, listener) {}

        removeListener(e, listener) {
          var index, listeners;
          listeners = this.getListeners(e);
          index = listeners.indexOf(listener);
          if (index !== -1) {
            listeners.splice(index, 1);
            return this.listenerRemoved(e, listener);
          }
        }

        listenerRemoved(e, listener) {}

        emitEvent(e, ...args) {
          var listeners;
          listeners = this.getListeners(e);
          return listeners.forEach(function(listener) {
            return listener(...args);
          });
        }

      };

      EventEmitter.prototype.emit = EventEmitter.prototype.emitEvent;

      EventEmitter.prototype.trigger = EventEmitter.prototype.emitEvent;

      EventEmitter.prototype.on = EventEmitter.prototype.addListener;

      EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

      return EventEmitter;

    }).call(this);
    return EventEmitter;
  });

  (function(definition) {
    Spark.Updater = definition();
    return Spark.Updater.definition = definition;
  })(function(dependencies = {}) {
    var Binder, Updater;
    Binder = dependencies.hasOwnProperty("Binder") ? dependencies.Binder : Spark.Binder;
    Updater = class Updater {
      constructor() {
        this.callbacks = [];
        this.next = [];
        this.updating = false;
      }

      update() {
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
      }

      addCallback(callback) {
        if (!this.callbacks.includes(callback)) {
          this.callbacks.push(callback);
        }
        if (this.updating && !this.next.includes(callback)) {
          return this.next.push(callback);
        }
      }

      nextTick(callback) {
        if (this.updating) {
          if (!this.next.includes(callback)) {
            return this.next.push(callback);
          }
        } else {
          return this.addCallback(callback);
        }
      }

      removeCallback(callback) {
        var index;
        index = this.callbacks.indexOf(callback);
        if (index !== -1) {
          this.callbacks.splice(index, 1);
        }
        index = this.next.indexOf(callback);
        if (index !== -1) {
          return this.next.splice(index, 1);
        }
      }

      getBinder() {
        return new Updater.Binder(this);
      }

      destroy() {
        this.callbacks = [];
        return this.next = [];
      }

    };
    Updater.Binder = (function(superClass) {
      class Binder extends superClass {
        constructor(target1, callback1) {
          super();
          this.target = target1;
          this.callback = callback1;
          this.ref = {
            target: this.target,
            callback: this.callback
          };
        }

        doBind() {
          return this.target.addCallback(this.callback);
        }

        doUnbind() {
          return this.target.removeCallback(this.callback);
        }

      };

      return Binder;

    }).call(this, Binder);
    return Updater;
  });

}).call(this);
