(function() {
  var Spark,
    indexOf = [].indexOf;

  Spark = typeof module !== "undefined" && module !== null ? module.exports = {} : (this.Spark == null ? this.Spark = {} : void 0, this.Spark);

  (function(definition) {
    Spark.Referred = definition();
    return Spark.Referred.definition = definition;
  })(function() {
    var Referred;
    Referred = (function() {
      class Referred {
        compareRefered(refered) {
          return this.constructor.compareRefered(refered, this);
        }

        getRef() {}

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

      Object.defineProperty(Referred.prototype, 'ref', {
        get: function() {
          return this.getRef();
        }
      });

      return Referred;

    }).call(this);
    return Referred;
  });

  (function(definition) {
    Spark.Binder = definition();
    return Spark.Binder.definition = definition;
  })(function(dependencies = {}) {
    var Binder, Referred;
    Referred = dependencies.hasOwnProperty("Referred") ? dependencies.Referred : Spark.Referred;
    Binder = class Binder extends Referred {
      bind() {
        if (!this.binded && this.canBind()) {
          this.doBind();
        }
        return this.binded = true;
      }

      canBind() {
        return (this.callback != null) && (this.target != null);
      }

      doBind() {
        throw new Error('Not implemented');
      }

      unbind() {
        if (this.binded && this.canBind()) {
          this.doUnbind();
        }
        return this.binded = false;
      }

      doUnbind() {
        throw new Error('Not implemented');
      }

      equals(binder) {
        return this.compareRefered(binder);
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
          if (old != null) {
            old = this.copy(old.slice());
          } else {
            old = [];
          }
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

        getRandom() {
          return this._array[Math.floor(Math.random() * this._array.length)];
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
        makeOnce: function(source, target) {
          var ref3;
          if (!((ref3 = target.extensions) != null ? ref3.includes(source) : void 0)) {
            return this.make(source, target);
          }
        },
        make: function(source, target) {
          var j, len, prop, ref3;
          ref3 = this.getExtensionProperties(source, target);
          for (j = 0, len = ref3.length; j < len; j++) {
            prop = ref3[j];
            Object.defineProperty(target, prop.name, prop);
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
                return !target.hasOwnProperty(key) && key.substr(0, 2) !== "__" && indexOf.call(exclude, key) < 0 && !props.find(function(prop) {
                  return prop.name === key;
                });
              }).map(function(key) {
                var prop;
                prop = Object.getOwnPropertyDescriptor(obj, key);
                prop.name = key;
                return prop;
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
          listeners = this.getListeners(e).slice();
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
    Spark.Overrider = definition();
    return Spark.Overrider.definition = definition;
  })(function() {
    var Overrider;
    Overrider = (function() {
      // todo :   
      //  simplified form : @withoutName method  
      class Overrider {
        static overrides(overrides) {
          return this.Override.applyMany(this.prototype, this.name, overrides);
        }

        getFinalProperties() {
          if (this._overrides != null) {
            return ['_overrides'].concat(Object.keys(this._overrides));
          } else {
            return [];
          }
        }

        extended(target) {
          if (this._overrides != null) {
            this.constructor.Override.applyMany(target, this.constructor.name, this._overrides);
          }
          if (this.constructor === Overrider) {
            return target.extended = this.extended;
          }
        }

      };

      Overrider.Override = {
        makeMany: function(target, namespace, overrides) {
          var fn, key, override, results;
          results = [];
          for (key in overrides) {
            fn = overrides[key];
            results.push(override = this.make(target, namespace, key, fn));
          }
          return results;
        },
        applyMany: function(target, namespace, overrides) {
          var key, override, results;
          results = [];
          for (key in overrides) {
            override = overrides[key];
            if (typeof override === "function") {
              override = this.make(target, namespace, key, override);
            }
            results.push(this.apply(target, namespace, override));
          }
          return results;
        },
        make: function(target, namespace, fnName, fn) {
          var override;
          override = {
            fn: {
              current: fn
            },
            name: fnName
          };
          override.fn['with' + namespace] = fn;
          return override;
        },
        emptyFn: function() {},
        apply: function(target, namespace, override) {
          var fnName, overrides, ref3, ref4, without;
          fnName = override.name;
          overrides = target._overrides != null ? Object.assign({}, target._overrides) : {};
          without = ((ref3 = target._overrides) != null ? (ref4 = ref3[fnName]) != null ? ref4.fn.current : void 0 : void 0) || target[fnName];
          override = Object.assign({}, override);
          if (overrides[fnName] != null) {
            override.fn = Object.assign({}, overrides[fnName].fn, override.fn);
          } else {
            override.fn = Object.assign({}, override.fn);
          }
          override.fn['without' + namespace] = without || this.emptyFn;
          if (without == null) {
            override.missingWithout = 'without' + namespace;
          } else if (override.missingWithout) {
            override.fn[override.missingWithout] = without;
          }
          Object.defineProperty(target, fnName, {
            configurable: true,
            get: function() {
              var finalFn, fn, key, ref5;
              finalFn = override.fn.current.bind(this);
              ref5 = override.fn;
              for (key in ref5) {
                fn = ref5[key];
                finalFn[key] = fn.bind(this);
              }
              if (this.constructor.prototype !== this) {
                Object.defineProperty(this, fnName, {
                  value: finalFn
                });
              }
              return finalFn;
            }
          });
          overrides[fnName] = override;
          return target._overrides = overrides;
        }
      };

      return Overrider;

    }).call(this);
    return Overrider;
  });

  (function(definition) {
    Spark.PropertyWatcher = definition();
    return Spark.PropertyWatcher.definition = definition;
  })(function(dependencies = {}) {
    var Binder, PropertyWatcher;
    Binder = dependencies.hasOwnProperty("Binder") ? dependencies.Binder : Spark.Binder;
    // todo: dont use Invalidator  
    PropertyWatcher = class PropertyWatcher extends Binder {
      constructor(options) {
        super();
        this.invalidateCallback = () => {
          return this.invalidate();
        };
        this.updateCallback = (old) => {
          return this.update(old);
        };
        if (options != null) {
          this.loadOptions(options);
        }
        if (!((options != null ? options.initByLoader : void 0) && (options.loader != null))) {
          this.init();
        }
      }

      loadOptions(options) {
        this.scope = options.scope;
        if (options.loaderAsScope && (options.loader != null)) {
          this.scope = options.loader;
        }
        this.property = options.property;
        this.callback = options.callback;
        return this.autoBind = options.autoBind;
      }

      init() {
        if (this.autoBind) {
          return this.bind();
        }
      }

      getProperty() {
        if (typeof this.property === "string") {
          this.property = this.scope.getPropertyInstance(this.property);
        }
        return this.property;
      }

      canBind() {
        return this.getProperty() != null;
      }

      doBind() {
        this.update();
        this.getProperty().on('invalidated', this.invalidateCallback);
        return this.getProperty().on('updated', this.updateCallback);
      }

      doUnbind() {
        this.getProperty().off('invalidated', this.invalidateCallback);
        return this.getProperty().off('updated', this.updateCallback);
      }

      getRef() {
        if (typeof this.property === "string") {
          return {
            property: this.property,
            target: this.scope,
            callback: this.callback
          };
        } else {
          return {
            property: this.property.property.name,
            target: this.property.obj,
            callback: this.callback
          };
        }
      }

      invalidate() {
        return this.getProperty().get();
      }

      update(old) {
        var value;
        value = this.getProperty().get();
        return this.handleChange(value, old);
      }

      handleChange(value, old) {
        return this.callback.call(this.scope, old);
      }

    };
    return PropertyWatcher;
  });

  (function(definition) {
    Spark.CollectionPropertyWatcher = definition();
    return Spark.CollectionPropertyWatcher.definition = definition;
  })(function(dependencies = {}) {
    var CollectionPropertyWatcher, PropertyWatcher;
    PropertyWatcher = dependencies.hasOwnProperty("PropertyWatcher") ? dependencies.PropertyWatcher : Spark.PropertyWatcher;
    CollectionPropertyWatcher = class CollectionPropertyWatcher extends PropertyWatcher {
      loadOptions(options) {
        super.loadOptions(options);
        this.onAdded = options.onAdded;
        return this.onRemoved = options.onRemoved;
      }

      handleChange(value, old) {
        old = value.copy(old || []);
        if (typeof this.callback === 'function') {
          this.callback.call(this.scope, old);
        }
        if (typeof this.onAdded === 'function') {
          value.forEach((item, i) => {
            if (!old.includes(item)) {
              return this.onAdded.call(this.scope, item);
            }
          });
        }
        if (typeof this.onRemoved === 'function') {
          return old.forEach((item, i) => {
            if (!value.includes(item)) {
              return this.onRemoved.call(this.scope, item);
            }
          });
        }
      }

    };
    return CollectionPropertyWatcher;
  });

  (function(definition) {
    Spark.Loader = definition();
    return Spark.Loader.definition = definition;
  })(function(dependencies = {}) {
    var Loader, Overrider;
    Overrider = dependencies.hasOwnProperty("Overrider") ? dependencies.Overrider : Spark.Overrider;
    Loader = (function() {
      class Loader extends Overrider {
        constructor() {
          initPreloaded();
        }

        initPreloaded() {
          var defList;
          defList = this.preloaded;
          this.preloaded = [];
          return this.load(defList);
        }

        load(defList) {
          var loaded, toLoad;
          toLoad = [];
          loaded = defList.map((def) => {
            var instance;
            if (def.instance == null) {
              def = Object.assign({
                loader: this
              }, def);
              instance = Loader.load(def);
              def = Object.assign({
                instance: instance
              }, def);
              if (def.initByLoader && (instance.init != null)) {
                toLoad.push(instance);
              }
            }
            return def;
          });
          this.preloaded = this.preloaded.concat(loaded);
          return toLoad.forEach(function(instance) {
            return instance.init();
          });
        }

        preload(def) {
          if (!Array.isArray(def)) {
            def = [def];
          }
          return this.preloaded = this.preloaded.concat(def);
        }

        destroyLoaded() {
          return this.preloaded.forEach(function(def) {
            var ref3;
            return (ref3 = def.instance) != null ? typeof ref3.destroy === "function" ? ref3.destroy() : void 0 : void 0;
          });
        }

        static loadMany(def) {
          return def.map((d) => {
            return this.load(d);
          });
        }

        static load(def) {
          return new def.type(def);
        }

        static preload(def) {
          return this.prototype.preload(def);
        }

      };

      Loader.prototype.preloaded = [];

      Loader.overrides({
        init: function() {
          this.init.withoutLoader();
          return this.initPreloaded();
        },
        destroy: function() {
          this.destroy.withoutLoader();
          return this.destroyLoaded();
        }
      });

      return Loader;

    }).call(this);
    return Loader;
  });

  (function(definition) {
    Spark.BasicProperty = definition();
    return Spark.BasicProperty.definition = definition;
  })(function(dependencies = {}) {
    var BasicProperty, EventEmitter, Loader, Mixable, PropertyWatcher, Referred;
    Mixable = dependencies.hasOwnProperty("Mixable") ? dependencies.Mixable : Spark.Mixable;
    EventEmitter = dependencies.hasOwnProperty("EventEmitter") ? dependencies.EventEmitter : Spark.EventEmitter;
    Loader = dependencies.hasOwnProperty("Loader") ? dependencies.Loader : Spark.Loader;
    PropertyWatcher = dependencies.hasOwnProperty("PropertyWatcher") ? dependencies.PropertyWatcher : Spark.PropertyWatcher;
    Referred = dependencies.hasOwnProperty("Referred") ? dependencies.Referred : Spark.Referred;
    BasicProperty = (function() {
      class BasicProperty extends Mixable {
        constructor(property1, obj3) {
          super();
          this.property = property1;
          this.obj = obj3;
        }

        init() {
          var preload;
          this.value = this.ingest(this.default);
          this.calculated = false;
          this.initiated = false;
          preload = this.constructor.getPreload(this.obj, this.property, this);
          if (preload.length > 0) {
            return Loader.loadMany(preload);
          }
        }

        get() {
          this.calculated = true;
          if (!this.initiated) {
            this.initiated = true;
            this.emitEvent('updated');
          }
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
          this.emitEvent('updated', old);
          this.emitEvent('changed', old);
          return this;
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
          return prop.instanceType.prototype.default = prop.options.default;
        }

        static bind(target, prop) {
          var maj, opt, preload;
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
          target['invalidate' + maj] = function() {
            prop.getInstance(this).invalidate();
            return this;
          };
          preload = this.getPreload(target, prop);
          if (preload.length > 0) {
            Mixable.Extension.makeOnce(Loader.prototype, target);
            return target.preload(preload);
          }
        }

        static getPreload(target, prop, instance) {
          var preload, ref, ref3;
          preload = [];
          if (typeof prop.options.change === "function") {
            ref = {
              prop: prop.name,
              callback: prop.options.change,
              context: 'change'
            };
            if (!((ref3 = target.preloaded) != null ? ref3.find(function(loaded) {
              return Referred.compareRef(ref, loaded.ref) && !instance || (loaded.instance != null);
            }) : void 0)) {
              preload.push({
                type: PropertyWatcher,
                loaderAsScope: true,
                scope: target,
                property: instance || prop.name,
                initByLoader: true,
                autoBind: true,
                callback: prop.options.change,
                ref: ref
              });
            }
          }
          return preload;
        }

      };

      BasicProperty.extend(EventEmitter);

      return BasicProperty;

    }).call(this);
    return BasicProperty;
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
      }

      getRef() {
        return {
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
        constructor(invalidated, scope = null) {
          super();
          this.invalidated = invalidated;
          this.scope = scope;
          this.invalidationEvents = [];
          this.recycled = [];
          this.unknowns = [];
          this.strict = this.constructor.strict;
          this.invalid = false;
          this.invalidateCallback = () => {
            this.invalidate();
            return null;
          };
          this.invalidateCallback.owner = this;
        }

        invalidate() {
          var functName;
          this.invalid = true;
          if (typeof this.invalidated === "function") {
            return this.invalidated();
          } else if (typeof this.callback === "function") {
            return this.callback();
          } else if ((this.invalidated != null) && typeof this.invalidated.invalidate === "function") {
            return this.invalidated.invalidate();
          } else if (typeof this.invalidated === "string") {
            functName = 'invalidate' + this.invalidated.charAt(0).toUpperCase() + this.invalidated.slice(1);
            if (typeof this.scope[functName] === "function") {
              return this.scope[functName]();
            } else {
              return this.scope[this.invalidated] = null;
            }
          }
        }

        unknown() {
          var ref3;
          if (typeof ((ref3 = this.invalidated) != null ? ref3.unknown : void 0) === "function") {
            return this.invalidated.unknown();
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

        getUnknownCallback(prop) {
          var callback;
          callback = () => {
            return this.addUnknown(function() {
              return prop.get();
            }, prop);
          };
          callback.ref = {
            prop: prop
          };
          return callback;
        }

        addUnknown(fn, prop) {
          if (!this.findUnknown(prop)) {
            fn.ref = {
              "prop": prop
            };
            this.unknowns.push(fn);
            return this.unknown();
          }
        }

        findUnknown(prop) {
          if ((prop != null) || (typeof target !== "undefined" && target !== null)) {
            return this.unknowns.find(function(unknown) {
              return unknown.ref.prop === prop;
            });
          }
        }

        event(event, target = this.scope) {
          if (this.checkEmitter(target)) {
            return this.addEventBind(event, target);
          }
        }

        value(val, event, target = this.scope) {
          this.event(event, target);
          return val;
        }

        prop(prop, target = this.scope) {
          if (typeof prop === 'string') {
            if (target.getPropertyInstance != null) {
              prop = target.getPropertyInstance(prop);
            } else {
              return target[prop];
            }
          } else if (!this.checkPropInstance(prop)) {
            throw new Error('Property must be a PropertyInstance or a string');
          }
          this.addEventBind('invalidated', prop, this.getUnknownCallback(prop));
          return this.value(prop.get(), 'updated', prop);
        }

        propPath(path, target = this.scope) {
          var prop, val;
          path = path.split('.');
          val = target;
          while ((val != null) && path.length > 0) {
            prop = path.shift();
            val = this.prop(prop, val);
          }
          return val;
        }

        propInitiated(prop, target = this.scope) {
          var initiated;
          if (typeof prop === 'string' && (target.getPropertyInstance != null)) {
            prop = target.getPropertyInstance(prop);
          } else if (!this.checkPropInstance(prop)) {
            throw new Error('Property must be a PropertyInstance or a string');
          }
          initiated = prop.initiated;
          if (!initiated) {
            this.event('updated', prop);
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

        validateUnknowns() {
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
          this.invalid = false;
          return this.invalidationEvents.forEach(function(eventBind) {
            return eventBind.bind();
          });
        }

        recycle(callback) {
          var done, res;
          this.recycled = this.invalidationEvents;
          this.invalidationEvents = [];
          done = this.endRecycle.bind(this);
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

        endRecycle() {
          this.recycled.forEach(function(eventBind) {
            return eventBind.unbind();
          });
          return this.recycled = [];
        }

        checkEmitter(emitter) {
          return EventBind.checkEmitter(emitter, this.strict);
        }

        checkPropInstance(prop) {
          return typeof prop.get === "function" && this.checkEmitter(prop);
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
    Spark.DynamicProperty = definition();
    return Spark.DynamicProperty.definition = definition;
  })(function(dependencies = {}) {
    var BasicProperty, DynamicProperty, Invalidator;
    Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : Spark.Invalidator;
    BasicProperty = dependencies.hasOwnProperty("BasicProperty") ? dependencies.BasicProperty : Spark.BasicProperty;
    DynamicProperty = class DynamicProperty extends BasicProperty {
      callbackGet() {
        var res;
        res = this.callOptionFunct("get");
        this.revalidated();
        return res;
      }

      invalidate() {
        if (this.calculated) {
          this.calculated = false;
          this._invalidateNotice();
        }
        return this;
      }

      _invalidateNotice() {
        this.emitEvent('invalidated');
        return true;
      }

      static compose(prop) {
        if (typeof prop.options.get === 'function' || typeof prop.options.calcul === 'function') {
          if (prop.instanceType == null) {
            prop.instanceType = class extends DynamicProperty {};
          }
        }
        if (typeof prop.options.get === 'function') {
          return prop.instanceType.prototype.get = this.prototype.callbackGet;
        }
      }

    };
    return DynamicProperty;
  });

  (function(definition) {
    Spark.CollectionProperty = definition();
    return Spark.CollectionProperty.definition = definition;
  })(function(dependencies = {}) {
    var Collection, CollectionProperty, CollectionPropertyWatcher, DynamicProperty;
    DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : Spark.DynamicProperty;
    Collection = dependencies.hasOwnProperty("Collection") ? dependencies.Collection : Spark.Collection;
    CollectionPropertyWatcher = dependencies.hasOwnProperty("CollectionPropertyWatcher") ? dependencies.CollectionPropertyWatcher : Spark.CollectionPropertyWatcher;
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

        static compose(prop) {
          if (prop.options.collection != null) {
            prop.instanceType = class extends CollectionProperty {};
            prop.instanceType.prototype.collectionOptions = Object.assign({}, this.defaultCollectionOptions, typeof prop.options.collection === 'object' ? prop.options.collection : {});
            if (prop.options.collection.compare != null) {
              return prop.instanceType.prototype.checkChanges = this.prototype.checkChangedItems;
            }
          }
        }

        static getPreload(target, prop, instance) {
          var preload, ref, ref3;
          preload = [];
          if (typeof prop.options.change === "function" || typeof prop.options.itemAdded === 'function' || typeof prop.options.itemRemoved === 'function') {
            ref = {
              prop: prop.name,
              context: 'change'
            };
            if (!((ref3 = target.preloaded) != null ? ref3.find(function(loaded) {
              return Referred.compareRef(ref, loaded.ref) && (loaded.instance != null);
            }) : void 0)) {
              preload.push({
                type: CollectionPropertyWatcher,
                loaderAsScope: true,
                scope: target,
                property: instance || prop.name,
                initByLoader: true,
                autoBind: true,
                callback: prop.options.change,
                onAdded: prop.options.itemAdded,
                onRemoved: prop.options.itemRemoved,
                ref: ref
              });
            }
          }
          return preload;
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
    Spark.CalculatedProperty = definition();
    return Spark.CalculatedProperty.definition = definition;
  })(function(dependencies = {}) {
    var CalculatedProperty, DynamicProperty, Invalidator, Overrider;
    Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : Spark.Invalidator;
    DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : Spark.DynamicProperty;
    Overrider = dependencies.hasOwnProperty("Overrider") ? dependencies.Overrider : Spark.Overrider;
    CalculatedProperty = (function() {
      class CalculatedProperty extends DynamicProperty {
        calcul() {
          this.value = this.callOptionFunct(this.calculFunct);
          this.manual = false;
          this.revalidated();
          return this.value;
        }

        static compose(prop) {
          if (typeof prop.options.calcul === 'function') {
            prop.instanceType.prototype.calculFunct = prop.options.calcul;
            if (!(prop.options.calcul.length > 0)) {
              return prop.instanceType.extend(CalculatedProperty);
            }
          }
        }

      };

      CalculatedProperty.extend(Overrider);

      CalculatedProperty.overrides({
        get: function() {
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
              } else {
                this.emitEvent('updated', old);
              }
            } else if (!initiated) {
              this.emitEvent('updated', old);
            }
          }
          return this.output();
        }
      });

      return CalculatedProperty;

    }).call(this);
    return CalculatedProperty;
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
          this.initComposed();
          return super.init();
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
            return prop.instanceType = class extends ComposedProperty {};
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
    Spark.InvalidatedProperty = definition();
    return Spark.InvalidatedProperty.definition = definition;
  })(function(dependencies = {}) {
    var CalculatedProperty, InvalidatedProperty, Invalidator;
    Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : Spark.Invalidator;
    CalculatedProperty = dependencies.hasOwnProperty("CalculatedProperty") ? dependencies.CalculatedProperty : Spark.CalculatedProperty;
    InvalidatedProperty = (function() {
      class InvalidatedProperty extends CalculatedProperty {
        unknown() {
          if (this.calculated || this.active === false) {
            this._invalidateNotice();
          }
          return this;
        }

        static compose(prop) {
          if (typeof prop.options.calcul === 'function' && prop.options.calcul.length > 0) {
            return prop.instanceType.extend(InvalidatedProperty);
          }
        }

      };

      InvalidatedProperty.overrides({
        calcul: function() {
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
        },
        destroy: function() {
          this.destroy.withoutInvalidatedProperty();
          if (this.invalidator != null) {
            return this.invalidator.unbind();
          }
        },
        invalidate: function() {
          if (this.calculated || this.active === false) {
            this.calculated = false;
            this._invalidateNotice();
            if (!this.calculated && (this.invalidator != null)) {
              this.invalidator.unbind();
            }
          }
          return this;
        }
      });

      return InvalidatedProperty;

    }).call(this);
    return InvalidatedProperty;
  });

  (function(definition) {
    Spark.Property = definition();
    return Spark.Property.definition = definition;
  })(function(dependencies = {}) {
    var BasicProperty, CalculatedProperty, CollectionProperty, ComposedProperty, DynamicProperty, InvalidatedProperty, Mixable, Property, PropertyOwner;
    BasicProperty = dependencies.hasOwnProperty("BasicProperty") ? dependencies.BasicProperty : Spark.BasicProperty;
    CollectionProperty = dependencies.hasOwnProperty("CollectionProperty") ? dependencies.CollectionProperty : Spark.CollectionProperty;
    ComposedProperty = dependencies.hasOwnProperty("ComposedProperty") ? dependencies.ComposedProperty : Spark.ComposedProperty;
    DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : Spark.DynamicProperty;
    CalculatedProperty = dependencies.hasOwnProperty("CalculatedProperty") ? dependencies.CalculatedProperty : Spark.CalculatedProperty;
    InvalidatedProperty = dependencies.hasOwnProperty("InvalidatedProperty") ? dependencies.InvalidatedProperty : Spark.InvalidatedProperty;
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
            obj[varName].init();
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

      Property.prototype.composers = [ComposedProperty, CollectionProperty, DynamicProperty, BasicProperty, CalculatedProperty, InvalidatedProperty];

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
      constructor() {
        super();
        this.init();
      }

      init() {}

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
        if (this._callbacks[name] == null) {
          this._callbacks[name] = (...args) => {
            this[name].apply(this, args);
            return null;
          };
          this._callbacks[name].owner = this;
        }
        return this._callbacks[name];
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
    Spark.Updater = definition();
    return Spark.Updater.definition = definition;
  })(function(dependencies = {}) {
    var Binder, Updater;
    Binder = dependencies.hasOwnProperty("Binder") ? dependencies.Binder : Spark.Binder;
    Updater = class Updater {
      constructor(options) {
        var ref3;
        this.callbacks = [];
        this.next = [];
        this.updating = false;
        if ((options != null ? options.callback : void 0) != null) {
          this.addCallback(options.callback);
        }
        if ((options != null ? (ref3 = options.callbacks) != null ? ref3.forEach : void 0 : void 0) != null) {
          options.callbacks.forEach((callback) => {
            return this.addCallback(callback);
          });
        }
      }

      update() {
        var callback;
        this.updating = true;
        this.next = this.callbacks.slice();
        while (this.callbacks.length > 0) {
          callback = this.callbacks.shift();
          this.runCallback(callback);
        }
        this.callbacks = this.next;
        this.updating = false;
        return this;
      }

      runCallback(callback) {
        return callback();
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
        }

        getRef() {
          return {
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

  (function(definition) {
    Spark.Invalidated = definition();
    return Spark.Invalidated.definition = definition;
  })(function(dependencies = {}) {
    var Invalidated, Invalidator;
    Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : Spark.Invalidator;
    Invalidated = class Invalidated {
      constructor(options) {
        if (options != null) {
          this.loadOptions(options);
        }
        if (!((options != null ? options.initByLoader : void 0) && (options.loader != null))) {
          this.init();
        }
      }

      loadOptions(options) {
        this.scope = options.scope;
        if (options.loaderAsScope && (options.loader != null)) {
          this.scope = options.loader;
        }
        return this.callback = options.callback;
      }

      init() {
        return this.update();
      }

      unknown() {
        return this.invalidator.validateUnknowns();
      }

      invalidate() {
        return this.update();
      }

      update() {
        if (this.invalidator == null) {
          this.invalidator = new Invalidator(this, this.scope);
        }
        this.invalidator.recycle();
        this.handleUpdate(this.invalidator);
        this.invalidator.endRecycle();
        this.invalidator.bind();
        return this;
      }

      handleUpdate(invalidator) {
        if (this.scope != null) {
          return this.callback.call(this.scope, invalidator);
        } else {
          return this.callback(invalidator);
        }
      }

      destroy() {
        if (this.invalidator) {
          return this.invalidator.unbind();
        }
      }

    };
    return Invalidated;
  });

}).call(this);
