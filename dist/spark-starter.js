(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Spark = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = {
  Binder: require('./src/Binder'),
  EventBind: require('./src/EventBind'),
  Reference: require('./src/Reference')
}

},{"./src/Binder":2,"./src/EventBind":3,"./src/Reference":4}],2:[function(require,module,exports){
class Binder {
  toggleBind (val = !this.binded) {
    if (val) {
      return this.bind()
    } else {
      return this.unbind()
    }
  }

  bind () {
    if (!this.binded && this.canBind()) {
      this.doBind()
    }
    this.binded = true
    return this
  }

  canBind () {
    return true
  }

  doBind () {
    throw new Error('Not implemented')
  }

  unbind () {
    if (this.binded && this.canBind()) {
      this.doUnbind()
    }
    this.binded = false
    return this
  }

  doUnbind () {
    throw new Error('Not implemented')
  }

  destroy () {
    this.unbind()
  }
};

module.exports = Binder

},{}],3:[function(require,module,exports){

const Binder = require('./Binder')
const Reference = require('./Reference')

class EventBind extends Binder {
  constructor (event1, target1, callback) {
    super()
    this.event = event1
    this.target = target1
    this.callback = callback
  }

  canBind () {
    return (this.callback != null) && (this.target != null)
  }

  bindTo (target) {
    this.unbind()
    this.target = target
    return this.bind()
  }

  doBind () {
    if (typeof this.target.addEventListener === 'function') {
      return this.target.addEventListener(this.event, this.callback)
    } else if (typeof this.target.addListener === 'function') {
      return this.target.addListener(this.event, this.callback)
    } else if (typeof this.target.on === 'function') {
      return this.target.on(this.event, this.callback)
    } else {
      throw new Error('No function to add event listeners was found')
    }
  }

  doUnbind () {
    if (typeof this.target.removeEventListener === 'function') {
      return this.target.removeEventListener(this.event, this.callback)
    } else if (typeof this.target.removeListener === 'function') {
      return this.target.removeListener(this.event, this.callback)
    } else if (typeof this.target.off === 'function') {
      return this.target.off(this.event, this.callback)
    } else {
      throw new Error('No function to remove event listeners was found')
    }
  }

  equals (eventBind) {
    return eventBind != null &&
      eventBind.constructor === this.constructor &&
      eventBind.event === this.event &&
      Reference.compareVal(eventBind.target, this.target) &&
      Reference.compareVal(eventBind.callback, this.callback)
  }

  static checkEmitter (emitter, fatal = true) {
    if (typeof emitter.addEventListener === 'function' || typeof emitter.addListener === 'function' || typeof emitter.on === 'function') {
      return true
    } else if (fatal) {
      throw new Error('No function to add event listeners was found')
    } else {
      return false
    }
  }
}
module.exports = EventBind

},{"./Binder":2,"./Reference":4}],4:[function(require,module,exports){
class Reference {
  constructor (data) {
    this.data = data
  }

  equals (ref) {
    return ref != null && ref.constructor === this.constructor && this.compareData(ref.data)
  }

  compareData (data) {
    if (data instanceof Reference) {
      return this.equals(data)
    }
    if (this.data === data) {
      return true
    }
    if (this.data == null || data == null) {
      return false
    }
    if (typeof this.data === 'object' && typeof data === 'object') {
      return Object.keys(this.data).length === Object.keys(data).length && Object.keys(data).every((key) => {
        return Reference.compareVal(this.data[key], data[key])
      })
    }
    return Reference.compareVal(this.data, data)
  }

  /**
   * @param {*} val1
   * @param {*} val2
   * @return {boolean}
   */
  static compareVal (val1, val2) {
    if (val1 === val2) {
      return true
    }
    if (val1 == null || val2 == null) {
      return false
    }
    if (typeof val1.equals === 'function') {
      return val1.equals(val2)
    }
    if (typeof val2.equals === 'function') {
      return val2.equals(val1)
    }
    if (Array.isArray(val1) && Array.isArray(val2)) {
      return val1.length === val2.length && val1.every((val, i) => {
        return this.compareVal(val, val2[i])
      })
    }
    // if (typeof val1 === 'object' && typeof val2 === 'object') {
    //   return Object.keys(val1).length === Object.keys(val2).length && Object.keys(val1).every((key) => {
    //     return this.compareVal(val1[key], val2[key])
    //   })
    // }
    return false
  }

  static makeReferred (obj, data) {
    if (data instanceof Reference) {
      obj.ref = data
    } else {
      obj.ref = new Reference(data)
    }
    obj.equals = function (obj2) {
      return obj2 != null && this.ref.equals(obj2.ref)
    }
    return obj
  }
};

module.exports = Reference

},{}],5:[function(require,module,exports){
module.exports = require('./src/Collection')

},{"./src/Collection":6}],6:[function(require,module,exports){
/**
 * @template T
 */
class Collection {
  /**
   * @param {Collection.<T>|Array.<T>|T} [arr]
   */
  constructor (arr) {
    if (arr != null) {
      if (typeof arr.toArray === 'function') {
        this._array = arr.toArray()
      } else if (Array.isArray(arr)) {
        this._array = arr
      } else {
        this._array = [arr]
      }
    } else {
      this._array = []
    }
  }

  changed () {}

  /**
   * @param {Collection.<T>|Array.<T>} old
   * @param {boolean} ordered
   * @param {function(T,T): boolean} compareFunction
   * @return {boolean}
   */
  checkChanges (old, ordered = true, compareFunction = null) {
    if (compareFunction == null) {
      compareFunction = function (a, b) {
        return a === b
      }
    }
    if (old != null) {
      old = this.copy(old.slice())
    } else {
      old = []
    }
    return this.count() !== old.length || (ordered ? this.some(function (val, i) {
      return !compareFunction(old.get(i), val)
    }) : this.some(function (a) {
      return !old.pluck(function (b) {
        return compareFunction(a, b)
      })
    }))
  }

  /**
   * @param {number} i
   * @return {T}
   */
  get (i) {
    return this._array[i]
  }

  /**
   * @return {T}
   */
  getRandom () {
    return this._array[Math.floor(Math.random() * this._array.length)]
  }

  /**
   * @param {number} i
   * @param {T} val
   * @return {T}
   */
  set (i, val) {
    var old
    if (this._array[i] !== val) {
      old = this.toArray()
      this._array[i] = val
      this.changed(old)
    }
    return val
  }

  /**
   * @param {T} val
   */
  add (val) {
    if (!this._array.includes(val)) {
      return this.push(val)
    }
    return this
  }

  /**
   * @param {T} val
   */
  remove (val) {
    var index, old
    index = this._array.indexOf(val)
    if (index !== -1) {
      old = this.toArray()
      this._array.splice(index, 1)
      this.changed(old)
    }
    return this
  }

  /**
   * @param {function(T): boolean} fn
   * @return {T}
   */
  pluck (fn) {
    var found, index, old
    index = this._array.findIndex(fn)
    if (index > -1) {
      old = this.toArray()
      found = this._array[index]
      this._array.splice(index, 1)
      this.changed(old)
      return found
    } else {
      return null
    }
  }

  /**
   * @return {Array.<T>}
   */
  toArray () {
    return this._array.slice()
  }

  /**
   * @return {number}
   */
  count () {
    return this._array.length
  }

  /**
   * @template ItemType
   * @param {Object} toAppend
   * @param {Collection.<ItemType>|Array.<ItemType>|ItemType} [arr]
   * @return {Collection.<ItemType>}
   */
  static newSubClass (toAppend, arr) {
    var SubClass
    if (typeof toAppend === 'object') {
      SubClass = class extends this {}
      Object.assign(SubClass.prototype, toAppend)
      return new SubClass(arr)
    } else {
      return new this(arr)
    }
  }

  /**
   * @param {Collection.<T>|Array.<T>|T} [arr]
   * @return {Collection.<T>}
   */
  copy (arr) {
    var coll
    if (arr == null) {
      arr = this.toArray()
    }
    coll = new this.constructor(arr)
    return coll
  }

  /**
   * @param {*} arr
   * @return {boolean}
   */
  equals (arr) {
    return (this.count() === (typeof arr.count === 'function' ? arr.count() : arr.length)) && this.every(function (val, i) {
      return arr[i] === val
    })
  }

  /**
   * @param {Collection.<T>|Array.<T>} arr
   * @return {Array.<T>}
   */
  getAddedFrom (arr) {
    return this._array.filter(function (item) {
      return !arr.includes(item)
    })
  }

  /**
   * @param {Collection.<T>|Array.<T>} arr
   * @return {Array.<T>}
   */
  getRemovedFrom (arr) {
    return arr.filter((item) => {
      return !this.includes(item)
    })
  }
};

Collection.readFunctions = ['every', 'find', 'findIndex', 'forEach', 'includes', 'indexOf', 'join', 'lastIndexOf', 'map', 'reduce', 'reduceRight', 'some', 'toString']

Collection.readListFunctions = ['concat', 'filter', 'slice']

Collection.writefunctions = ['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift']

Collection.readFunctions.forEach(function (funct) {
  Collection.prototype[funct] = function (...arg) {
    return this._array[funct](...arg)
  }
})

Collection.readListFunctions.forEach(function (funct) {
  Collection.prototype[funct] = function (...arg) {
    return this.copy(this._array[funct](...arg))
  }
})

Collection.writefunctions.forEach(function (funct) {
  Collection.prototype[funct] = function (...arg) {
    var old, res
    old = this.toArray()
    res = this._array[funct](...arg)
    this.changed(old)
    return res
  }
})

Object.defineProperty(Collection.prototype, 'length', {
  get: function () {
    return this.count()
  }
})

if (typeof Symbol !== 'undefined' && Symbol !== null ? Symbol.iterator : 0) {
  Collection.prototype[Symbol.iterator] = function () {
    return this._array[Symbol.iterator]()
  }
}

module.exports = Collection

},{}],7:[function(require,module,exports){
var Element, Mixable, PropertiesManager;

PropertiesManager = require('spark-properties').PropertiesManager;

Mixable = require('./Mixable');

module.exports = Element = (function() {
  class Element extends Mixable {
    constructor(data) {
      super();
      this.initPropertiesManager(data);
      this.init();
    }

    initPropertiesManager(data) {
      this.propertiesManager = this.propertiesManager.useScope(this);
      this.propertiesManager.initProperties();
      this.propertiesManager.createScopeGetterSetters();
      if (typeof data === "object") {
        this.propertiesManager.setPropertiesData(data);
      }
      return this;
    }

    init() {
      return this;
    }

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

    destroy() {
      return this.propertiesManager.destroy();
    }

    getFinalProperties() {
      return ['propertiesManager'];
    }

    extended(target) {
      if (target.propertiesManager) {
        return target.propertiesManager = target.propertiesManager.copyWith(this.propertiesManager.propertiesOptions);
      } else {
        return target.propertiesManager = this.propertiesManager;
      }
    }

    static property(prop, desc) {
      return this.prototype.propertiesManager = this.prototype.propertiesManager.withProperty(prop, desc);
    }

    static properties(properties) {
      return this.prototype.propertiesManager = this.prototype.propertiesManager.copyWith(properties);
    }

  };

  Element.prototype.propertiesManager = new PropertiesManager();

  return Element;

}).call(this);



},{"./Mixable":11,"spark-properties":17}],8:[function(require,module,exports){
var ActivablePropertyWatcher, Invalidator, PropertyWatcher;

PropertyWatcher = require('spark-properties').watchers.PropertyWatcher;

Invalidator = require('spark-properties').Invalidator;

module.exports = ActivablePropertyWatcher = class ActivablePropertyWatcher extends PropertyWatcher {
  loadOptions(options) {
    super.loadOptions(options);
    return this.active = options.active;
  }

  shouldBind() {
    var active;
    if (this.active != null) {
      if (this.invalidator == null) {
        this.invalidator = new Invalidator(this, this.scope);
        this.invalidator.callback = () => {
          return this.checkBind();
        };
      }
      this.invalidator.recycle();
      active = this.active(this.invalidator);
      this.invalidator.endRecycle();
      this.invalidator.bind();
      return active;
    } else {
      return true;
    }
  }

};



},{"spark-properties":17}],9:[function(require,module,exports){
var Invalidated, Invalidator;

Invalidator = require('spark-properties').Invalidator;

module.exports = Invalidated = class Invalidated {
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



},{"spark-properties":17}],10:[function(require,module,exports){
var Loader, Overrider;

Overrider = require('./Overrider');

module.exports = Loader = (function() {
  class Loader extends Overrider {
    constructor() {
      super();
      this.initPreloaded();
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
      return this.preloaded = (this.preloaded || []).concat(def);
    }

    destroyLoaded() {
      return this.preloaded.forEach(function(def) {
        var ref;
        return (ref = def.instance) != null ? typeof ref.destroy === "function" ? ref.destroy() : void 0 : void 0;
      });
    }

    getFinalProperties() {
      return super.getFinalProperties().concat(['preloaded']);
    }

    extended(target) {
      super.extended(target);
      if (this.preloaded) {
        return target.preloaded = (target.preloaded || []).concat(this.preloaded);
      }
    }

    static loadMany(def) {
      return def.map((d) => {
        return this.load(d);
      });
    }

    static load(def) {
      if (typeof def.type.copyWith === "function") {
        return def.type.copyWith(def);
      } else {
        return new def.type(def);
      }
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



},{"./Overrider":12}],11:[function(require,module,exports){
var Mixable,
  indexOf = [].indexOf;

module.exports = Mixable = (function() {
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
      var ref;
      if (!((ref = target.extensions) != null ? ref.includes(source) : void 0)) {
        return this.make(source, target);
      }
    },
    make: function(source, target) {
      var i, len, originalFinalProperties, prop, ref;
      ref = this.getExtensionProperties(source, target);
      for (i = 0, len = ref.length; i < len; i++) {
        prop = ref[i];
        Object.defineProperty(target, prop.name, prop);
      }
      if (source.getFinalProperties && target.getFinalProperties) {
        originalFinalProperties = target.getFinalProperties;
        target.getFinalProperties = function() {
          return source.getFinalProperties().concat(originalFinalProperties.call(this));
        };
      } else {
        target.getFinalProperties = source.getFinalProperties || target.getFinalProperties;
      }
      target.extensions = (target.extensions || []).concat([source]);
      if (typeof source.extended === 'function') {
        return source.extended(target);
      }
    },
    alwaysFinal: ['extended', 'extensions', '__super__', 'constructor', 'getFinalProperties'],
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



},{}],12:[function(require,module,exports){
// todo : 
//  simplified form : @withoutName method
var Overrider;

module.exports = Overrider = (function() {
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
      var fnName, overrides, ref, ref1, without;
      fnName = override.name;
      overrides = target._overrides != null ? Object.assign({}, target._overrides) : {};
      without = ((ref = target._overrides) != null ? (ref1 = ref[fnName]) != null ? ref1.fn.current : void 0 : void 0) || target[fnName];
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
          var finalFn, fn, key, ref2;
          finalFn = override.fn.current.bind(this);
          ref2 = override.fn;
          for (key in ref2) {
            fn = ref2[key];
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



},{}],13:[function(require,module,exports){
var Binder, Updater;

Binder = require('spark-binding').Binder;

module.exports = Updater = class Updater {
  constructor(options) {
    var ref;
    this.callbacks = [];
    this.next = [];
    this.updating = false;
    if ((options != null ? options.callback : void 0) != null) {
      this.addCallback(options.callback);
    }
    if ((options != null ? (ref = options.callbacks) != null ? ref.forEach : void 0 : void 0) != null) {
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
    constructor(target, callback1) {
      super();
      this.target = target;
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



},{"spark-binding":1}],14:[function(require,module,exports){
module.exports = {
  "Element": require("./Element"),
  "Loader": require("./Loader"),
  "Mixable": require("./Mixable"),
  "Overrider": require("./Overrider"),
  "Updater": require("./Updater"),
  "Invalidated": {
    "ActivablePropertyWatcher": require("./Invalidated/ActivablePropertyWatcher"),
    "Invalidated": require("./Invalidated/Invalidated"),
  },
}
},{"./Element":7,"./Invalidated/ActivablePropertyWatcher":8,"./Invalidated/Invalidated":9,"./Loader":10,"./Mixable":11,"./Overrider":12,"./Updater":13}],15:[function(require,module,exports){
var libs;

libs = require('./libs');

module.exports = Object.assign({
  'Collection': require('spark-collection')
}, libs, require('spark-properties'), require('spark-binding'));



},{"./libs":14,"spark-binding":1,"spark-collection":5,"spark-properties":17}],16:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],17:[function(require,module,exports){
module.exports = {
  Invalidator: require('./src/Invalidator'),
  PropertiesManager: require('./src/PropertiesManager'),
  Property: require('./src/Property'),
  getters: {
    BaseGetter: require('./src/getters/BaseGetter'),
    CalculatedGetter: require('./src/getters/CalculatedGetter'),
    CompositeGetter: require('./src/getters/CompositeGetter'),
    InvalidatedGetter: require('./src/getters/InvalidatedGetter'),
    ManualGetter: require('./src/getters/ManualGetter'),
    SimpleGetter: require('./src/getters/SimpleGetter')
  },
  setters: {
    BaseSetter: require('./src/setters/BaseSetter'),
    BaseValueSetter: require('./src/setters/BaseValueSetter'),
    CollectionSetter: require('./src/setters/CollectionSetter'),
    ManualSetter: require('./src/setters/ManualSetter'),
    SimpleSetter: require('./src/setters/SimpleSetter')
  },
  watchers: {
    CollectionPropertyWatcher: require('./src/watchers/CollectionPropertyWatcher'),
    PropertyWatcher: require('./src/watchers/PropertyWatcher')
  }
}

},{"./src/Invalidator":24,"./src/PropertiesManager":25,"./src/Property":26,"./src/getters/BaseGetter":27,"./src/getters/CalculatedGetter":28,"./src/getters/CompositeGetter":29,"./src/getters/InvalidatedGetter":30,"./src/getters/ManualGetter":31,"./src/getters/SimpleGetter":32,"./src/setters/BaseSetter":33,"./src/setters/BaseValueSetter":34,"./src/setters/CollectionSetter":35,"./src/setters/ManualSetter":36,"./src/setters/SimpleSetter":37,"./src/watchers/CollectionPropertyWatcher":38,"./src/watchers/PropertyWatcher":39}],18:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"./src/Binder":19,"./src/EventBind":20,"./src/Reference":21,"dup":1}],19:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}],20:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"./Binder":19,"./Reference":21,"dup":3}],21:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"dup":4}],22:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"./src/Collection":23,"dup":5}],23:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],24:[function(require,module,exports){
const Binder = require('spark-binding').Binder
const EventBind = require('spark-binding').EventBind

const pluck = function (arr, fn) {
  var found, index
  index = arr.findIndex(fn)
  if (index > -1) {
    found = arr[index]
    arr.splice(index, 1)
    return found
  } else {
    return null
  }
}

class Invalidator extends Binder {
  constructor (invalidated, scope = null) {
    super()
    this.invalidated = invalidated
    this.scope = scope
    this.invalidationEvents = []
    this.recycled = []
    this.unknowns = []
    this.strict = this.constructor.strict
    this.invalid = false
    this.invalidateCallback = () => {
      this.invalidate()
    }
    this.invalidateCallback.owner = this
  }

  invalidate () {
    var functName
    this.invalid = true
    if (typeof this.invalidated === 'function') {
      this.invalidated()
    } else if (typeof this.callback === 'function') {
      this.callback()
    } else if ((this.invalidated != null) && typeof this.invalidated.invalidate === 'function') {
      this.invalidated.invalidate()
    } else if (typeof this.invalidated === 'string') {
      functName = 'invalidate' + this.invalidated.charAt(0).toUpperCase() + this.invalidated.slice(1)
      if (typeof this.scope[functName] === 'function') {
        this.scope[functName]()
      } else {
        this.scope[this.invalidated] = null
      }
    }
    return this
  }

  unknown () {
    if (this.invalidated != null && typeof this.invalidated.unknown === 'function') {
      return this.invalidated.unknown()
    } else {
      return this.invalidate()
    }
  }

  addEventBind (event, target, callback) {
    return this.addBinder(new EventBind(event, target, callback))
  }

  addBinder (binder) {
    if (binder.callback == null) {
      binder.callback = this.invalidateCallback
    }
    if (!this.invalidationEvents.some(function (eventBind) {
      return eventBind.equals(binder)
    })) {
      return this.invalidationEvents.push(pluck(this.recycled, function (eventBind) {
        return eventBind.equals(binder)
      }) || binder)
    }
  }

  getUnknownCallback (prop) {
    var callback
    callback = () => {
      return this.addUnknown(function () {
        return prop.get()
      }, prop)
    }
    callback.prop = prop
    return callback
  }

  addUnknown (fn, prop) {
    if (!this.findUnknown(prop)) {
      fn.prop = prop
      this.unknowns.push(fn)
      return this.unknown()
    }
  }

  findUnknown (prop) {
    if (prop != null) {
      return this.unknowns.find(function (unknown) {
        return unknown.prop === prop
      })
    }
  }

  event (event, target = this.scope) {
    if (this.checkEmitter(target)) {
      return this.addEventBind(event, target)
    }
  }

  value (val, event, target = this.scope) {
    this.event(event, target)
    return val
  }

  /**
   * @template T
   * @param {Property<T>} prop
   * @return {T}
   */
  prop (prop) {
    if (prop != null) {
      this.addEventBind('invalidated', prop.events, this.getUnknownCallback(prop))
      return this.value(prop.get(), 'updated', prop.events)
    }
  }

  propByName (prop, target = this.scope) {
    if (target.propertiesManager != null) {
      return this.prop(target.propertiesManager.getProperty(prop))
    } else if (target[prop + 'Property'] != null) {
      return this.prop(target[prop + 'Property'])
    } else {
      return target[prop]
    }
  }

  propPath (path, target = this.scope) {
    var prop, val
    path = path.split('.')
    val = target
    while ((val != null) && path.length > 0) {
      prop = path.shift()
      val = this.propByName(prop, val)
    }
    return val
  }

  funct (funct) {
    var invalidator, res
    invalidator = new Invalidator(() => {
      return this.addUnknown(() => {
        var res2
        res2 = funct(invalidator)
        if (res !== res2) {
          return this.invalidate()
        }
      }, invalidator)
    })
    res = funct(invalidator)
    this.invalidationEvents.push(invalidator)
    return res
  }

  validateUnknowns () {
    var unknowns
    unknowns = this.unknowns
    this.unknowns = []
    return unknowns.forEach(function (unknown) {
      return unknown()
    })
  }

  isEmpty () {
    return this.invalidationEvents.length === 0
  }

  bind () {
    this.invalid = false
    this.invalidationEvents.forEach(function (eventBind) {
      eventBind.bind()
    })
    return this
  }

  recycle (fn) {
    var done, res
    this.recycled = this.invalidationEvents
    this.invalidationEvents = []
    done = this.endRecycle.bind(this)
    if (typeof fn === 'function') {
      if (fn.length > 1) {
        return fn(this, done)
      } else {
        res = fn(this)
        done()
        return res
      }
    } else {
      return done
    }
  }

  endRecycle () {
    this.recycled.forEach(function (eventBind) {
      return eventBind.unbind()
    })
    this.recycled = []
    return this
  }

  checkEmitter (emitter) {
    return EventBind.checkEmitter(emitter, this.strict)
  }

  checkPropInstance (prop) {
    return typeof prop.get === 'function' && this.checkEmitter(prop.events)
  }

  unbind () {
    this.invalidationEvents.forEach(function (eventBind) {
      eventBind.unbind()
    })
    return this
  }
};

Invalidator.strict = true

module.exports = Invalidator

},{"spark-binding":18}],25:[function(require,module,exports){
const Property = require('./Property')

class PropertiesManager {
  constructor (properties = {}, options = {}) {
    /**
     * @type {Array.<Property>}
     */
    this.properties = []
    this.globalOptions = Object.assign({}, options)
    this.propertiesOptions = Object.assign({}, properties)
  }

  /**
   * @param {*} properties
   * @param {*} options
   * @return {PropertiesManager}
   */
  copyWith (properties = {}, options = {}) {
    return new this.constructor(this.mergePropertiesOptions(this.propertiesOptions, properties), Object.assign({}, this.globalOptions, options))
  }

  withProperty (prop, options) {
    const properties = {}
    properties[prop] = options
    return this.copyWith(properties)
  }

  useScope (scope) {
    return this.copyWith({}, { scope: scope })
  }

  mergePropertiesOptions (...arg) {
    return arg.reduce((res, opt) => {
      Object.keys(opt).forEach((name) => {
        res[name] = this.mergePropertyOptions(res[name] || {}, opt[name])
      })
      return res
    }, {})
  }

  mergePropertyOptions (...arg) {
    const notMergable = ['default', 'scope']
    return arg.reduce((res, opt) => {
      Object.keys(opt).forEach((name) => {
        if (typeof res[name] === 'function' && typeof opt[name] === 'function' && !notMergable.includes(name)) {
          res[name] = this.mergeCallback(res[name], opt[name])
        } else {
          res[name] = opt[name]
        }
      })
      return res
    }, {})
  }

  mergeCallback (oldFunct, newFunct) {
    return function (...arg) {
      return newFunct.call(this, ...arg, oldFunct.bind(this))
    }
  }

  initProperties () {
    this.addProperties(this.propertiesOptions)
    return this
  }

  createScopeGetterSetters () {
    this.properties.forEach((prop) => prop.createScopeGetterSetters())
    return this
  }

  addProperty (name, options) {
    const prop = new Property(Object.assign({ name: name }, this.globalOptions, options))
    this.properties.push(prop)
    return this
  }

  addProperties (options) {
    Object.keys(options).forEach((name) => this.addProperty(name, options[name]))
    return this
  }

  /**
   * @param {string} name
   * @returns {Property}
   */
  getProperty (name) {
    return this.properties.find((prop) => prop.options.name === name)
  }

  setPropertiesData (data, options = {}) {
    Object.keys(data).forEach((key) => {
      if (((options.whitelist == null) || options.whitelist.indexOf(key) !== -1) && ((options.blacklist == null) || options.blacklist.indexOf(key) === -1)) {
        const prop = this.getProperty(key)
        if (prop) {
          prop.set(data[key])
        }
      }
    })
    return this
  }

  getManualDataProperties () {
    return this.properties.reduce((res, prop) => {
      if (prop.getter.calculated && prop.manual) {
        res[prop.options.name] = prop.get()
      }
      return res
    }, {})
  }

  destroy () {
    this.properties.forEach((prop) => prop.destroy())
  }
}

module.exports = PropertiesManager

},{"./Property":26}],26:[function(require,module,exports){
const EventEmitter = require('events').EventEmitter

const SimpleGetter = require('./getters/SimpleGetter')
const CalculatedGetter = require('./getters/CalculatedGetter')
const InvalidatedGetter = require('./getters/InvalidatedGetter')
const ManualGetter = require('./getters/ManualGetter')
const CompositeGetter = require('./getters/CompositeGetter')

const ManualSetter = require('./setters/ManualSetter')
const SimpleSetter = require('./setters/SimpleSetter')
const BaseValueSetter = require('./setters/BaseValueSetter')
const CollectionSetter = require('./setters/CollectionSetter')

/**
 * @template T
 */
class Property {
  /**
   * @typedef {Object} PropertyOptions
   * @property {T} [default]
   * @property {function(import("./Invalidator")): T} [calcul]
   * @property {function(): T} [get]
   * @property {function(T)} [set]
   * @property {function(T,T)|import("./PropertyWatcher")<T>} [change]
   * @property {boolean|string|function(T,T):T} [composed]
   * @property {boolean|Object} [collection]
   * @property {*} [scope]
   *
   * @param {PropertyOptions} options
   */
  constructor (options = {}) {
    this.options = Object.assign({}, Property.defaultOptions, options)
    this.init()
  }

  init () {
    /**
     * @type {EventEmitter}
     */
    this.events = new this.options.EventEmitterClass()
    this.makeSetter()
    this.makeGetter()
    this.setter.init()
    this.getter.init()
    this.setter.loadInternalWatcher()
  }

  makeGetter () {
    if (typeof this.options.get === 'function') {
      this.getter = new ManualGetter(this)
    } else if (this.options.composed != null && this.options.composed !== false) {
      this.getter = new CompositeGetter(this)
    } else if (typeof this.options.calcul === 'function') {
      if (this.options.calcul.length === 0) {
        this.getter = new CalculatedGetter(this)
      } else {
        this.getter = new InvalidatedGetter(this)
      }
    } else {
      this.getter = new SimpleGetter(this)
    }
  }

  makeSetter () {
    if (typeof this.options.set === 'function') {
      this.setter = new ManualSetter(this)
    } else if (this.options.collection != null && this.options.collection !== false) {
      this.setter = new CollectionSetter(this)
    } else if (this.options.composed != null && this.options.composed !== false) {
      this.setter = new BaseValueSetter(this)
    } else {
      this.setter = new SimpleSetter(this)
    }
  }

  /**
   * @param {*} options
   * @returns {Property<T>}
   */
  copyWith (options) {
    return new this.constructor(Object.assign({}, this.options, options))
  }

  /**
   * @returns {T}
   */
  get () {
    return this.getter.get()
  }

  invalidate () {
    this.getter.invalidate()
    return this
  }

  unknown () {
    this.getter.unknown()
    return this
  }

  set (val) {
    return this.setter.set(val)
  }

  createScopeGetterSetters () {
    if (this.options.scope) {
      const prop = this
      let opt = {}
      opt[this.options.name + 'Property'] = {
        get: function () {
          return prop
        }
      }
      opt = this.getter.getScopeGetterSetters(opt)
      opt = this.setter.getScopeGetterSetters(opt)
      Object.defineProperties(this.options.scope, opt)
    }
    return this
  }

  destroy () {
    if (this.options.destroy === true && this.value != null && this.value.destroy != null) {
      this.value.destroy()
    }
    if (typeof this.options.destroy === 'function') {
      this.callOptionFunct('destroy', this.value)
    }
    this.getter.destroy()
    this.value = null
  }

  callOptionFunct (funct, ...args) {
    if (typeof funct === 'string') {
      funct = this.options[funct]
    }
    return funct.apply(this.options.scope || this, args)
  }
}

Property.defaultOptions = {
  EventEmitterClass: EventEmitter
}
module.exports = Property

},{"./getters/CalculatedGetter":28,"./getters/CompositeGetter":29,"./getters/InvalidatedGetter":30,"./getters/ManualGetter":31,"./getters/SimpleGetter":32,"./setters/BaseValueSetter":34,"./setters/CollectionSetter":35,"./setters/ManualSetter":36,"./setters/SimpleSetter":37,"events":16}],27:[function(require,module,exports){

class BaseGetter {
  constructor (prop) {
    this.prop = prop
  }

  init () {
    this.calculated = false
    this.initiated = false
  }

  get () {
    throw new Error('Not implemented')
  }

  output () {
    if (typeof this.prop.options.output === 'function') {
      return this.prop.callOptionFunct('output', this.prop.value)
    } else {
      return this.prop.value
    }
  }

  revalidated () {
    this.calculated = true
    this.initiated = true
    return this
  }

  unknown () {
    if (this.calculated) {
      this.invalidateNotice()
    }
    return this
  }

  invalidate () {
    if (this.calculated) {
      this.calculated = false
      this.invalidateNotice()
    }
    return this
  }

  invalidateNotice () {
    this.prop.events.emit('invalidated')
  }

  /**
   * @param {PropertyDescriptorMap} opt
   * @return {PropertyDescriptorMap}
   */
  getScopeGetterSetters (opt) {
    const prop = this.prop
    opt[this.prop.options.name] = opt[this.prop.options.name] || {}
    opt[this.prop.options.name].get = function () {
      return prop.get()
    }
    opt[this.prop.options.name].enumerable = true
    opt[this.prop.options.name].configurable = true
    return opt
  }

  destroy () {
  }
}

module.exports = BaseGetter

},{}],28:[function(require,module,exports){

const BaseGetter = require('./BaseGetter')

class CalculatedGetter extends BaseGetter {
  get () {
    if (!this.calculated) {
      const old = this.prop.value
      const initiated = this.initiated
      this.calcul()
      if (!initiated) {
        this.prop.events.emit('updated', old)
      } else if (this.prop.setter.checkChanges(this.prop.value, old)) {
        this.prop.setter.changed(old)
      }
    }
    return this.output()
  }

  calcul () {
    this.prop.setter.setRawValue(this.prop.callOptionFunct('calcul'))
    this.prop.manual = false
    this.revalidated()
    return this.prop.value
  }
}

module.exports = CalculatedGetter

},{"./BaseGetter":27}],29:[function(require,module,exports){
const InvalidatedGetter = require('./InvalidatedGetter')
const Collection = require('spark-collection')
const Invalidator = require('../Invalidator')
const Reference = require('spark-binding').Reference

class CompositeGetter extends InvalidatedGetter {
  init () {
    super.init()
    if (this.prop.options.default != null) {
      this.baseValue = this.prop.options.default
    } else {
      this.prop.setter.setRawValue(null)
      this.baseValue = null
    }
    this.members = new CompositeGetter.Members(this.prop.options.members)
    if (this.prop.options.calcul != null) {
      this.members.unshift((prev, invalidator) => {
        return this.prop.options.calcul.bind(this.prop.options.scope)(invalidator)
      })
    }
    this.members.changed = (old) => {
      return this.invalidate()
    }
    this.prop.members = this.members

    if (typeof this.prop.options.composed === 'function') {
      this.join = this.prop.options.composed
    } else if (typeof this.prop.options.composed === 'string' && CompositeGetter.joinFunctions[this.prop.options.composed] != null) {
      this.join = CompositeGetter.joinFunctions[this.prop.options.composed]
    } else if (this.prop.options.default === false) {
      this.join = CompositeGetter.joinFunctions.or
    } else if (this.prop.options.default === true) {
      this.join = CompositeGetter.joinFunctions.and
    } else {
      this.join = CompositeGetter.joinFunctions.last
    }
  }

  calcul () {
    if (this.members.length) {
      if (!this.invalidator) {
        this.invalidator = new Invalidator(this.prop, this.prop.options.scope)
      }
      this.invalidator.recycle((invalidator, done) => {
        this.prop.setter.setRawValue(this.members.reduce((prev, member) => {
          var val
          val = typeof member === 'function' ? member(prev, this.invalidator) : member
          return this.join(prev, val)
        }, this.baseValue))
        done()
        if (invalidator.isEmpty()) {
          this.invalidator = null
        } else {
          invalidator.bind()
        }
      })
    } else {
      this.prop.setter.setRawValue(this.baseValue)
    }
    this.revalidated()
    return this.prop.value
  }

  /**
   * @param {PropertyDescriptorMap} opt
   * @return {PropertyDescriptorMap}
   */
  getScopeGetterSetters (opt) {
    opt = super.getScopeGetterSetters(opt)
    const members = this.members
    opt[this.prop.options.name + 'Members'] = {
      get: function () {
        return members
      }
    }
    return opt
  }
}

CompositeGetter.joinFunctions = {
  and: function (a, b) {
    return a && b
  },
  or: function (a, b) {
    return a || b
  },
  last: function (a, b) {
    return b
  },
  sum: function (a, b) {
    return a + b
  }
}

CompositeGetter.Members = class Members extends Collection {
  addProperty (prop) {
    if (this.findRefIndex(null, prop) === -1) {
      this.push(Reference.makeReferred(function (prev, invalidator) {
        return invalidator.prop(prop)
      }, {
        prop: prop
      }))
    }
    return this
  }

  addPropertyPath (name, obj) {
    if (this.findRefIndex(name, obj) === -1) {
      this.push(Reference.makeReferred(function (prev, invalidator) {
        return invalidator.propPath(name, obj)
      }, {
        name: name,
        obj: obj
      }))
    }
    return this
  }

  removeProperty (prop) {
    this.removeRef({ prop: prop })
    return this
  }

  addValueRef (val, data) {
    if (this.findRefIndex(data) === -1) {
      const fn = Reference.makeReferred(function (prev, invalidator) {
        return val
      }, data)
      fn.val = val
      this.push(fn)
    }
    return this
  }

  setValueRef (val, data) {
    const i = this.findRefIndex(data)
    if (i === -1) {
      this.addValueRef(val, data)
    } else if (this.get(i).val !== val) {
      const fn = Reference.makeReferred(function (prev, invalidator) {
        return val
      }, data)
      fn.val = val
      this.set(i, fn)
    }
    return this
  }

  getValueRef (data) {
    return this.findByRef(data).val
  }

  addFunctionRef (fn, data) {
    if (this.findRefIndex(data) === -1) {
      fn = Reference.makeReferred(fn, data)
      this.push(fn)
    }
    return this
  }

  findByRef (data) {
    return this._array[this.findRefIndex(data)]
  }

  findRefIndex (data) {
    return this._array.findIndex(function (member) {
      return (member.ref != null) && member.ref.compareData(data)
    })
  }

  removeRef (data) {
    var index, old
    index = this.findRefIndex(data)
    if (index !== -1) {
      old = this.toArray()
      this._array.splice(index, 1)
      this.changed(old)
    }
    return this
  }
}

module.exports = CompositeGetter

},{"../Invalidator":24,"./InvalidatedGetter":30,"spark-binding":18,"spark-collection":22}],30:[function(require,module,exports){
const Invalidator = require('../Invalidator')
const CalculatedGetter = require('./CalculatedGetter')

class InvalidatedGetter extends CalculatedGetter {
  get () {
    if (this.invalidator) {
      this.invalidator.validateUnknowns()
    }
    return super.get()
  }

  calcul () {
    if (!this.invalidator) {
      this.invalidator = new Invalidator(this.prop, this.prop.options.scope)
    }
    this.invalidator.recycle((invalidator, done) => {
      this.prop.setter.setRawValue(this.prop.callOptionFunct('calcul', invalidator))
      this.prop.manual = false
      done()
      if (invalidator.isEmpty()) {
        this.invalidator = null
      } else {
        invalidator.bind()
      }
    })
    this.revalidated()
    return this.output()
  }

  invalidate () {
    if (this.calculated) {
      this.calculated = false
      this.invalidateNotice()
      if (!this.calculated && this.invalidator != null) {
        this.invalidator.unbind()
      }
    }
    return this
  }

  destroy () {
    if (this.invalidator != null) {
      return this.invalidator.unbind()
    }
  }
}

module.exports = InvalidatedGetter

},{"../Invalidator":24,"./CalculatedGetter":28}],31:[function(require,module,exports){
const BaseGetter = require('./BaseGetter')

class ManualGetter extends BaseGetter {
  get () {
    this.prop.setter.setRawValue(this.prop.callOptionFunct('get'))
    this.calculated = true
    this.initiated = true
    return this.output()
  }
}

module.exports = ManualGetter

},{"./BaseGetter":27}],32:[function(require,module,exports){
const BaseGetter = require('./BaseGetter')

class SimpleGetter extends BaseGetter {
  get () {
    this.calculated = true
    if (!this.initiated) {
      this.initiated = true
      this.prop.events.emit('updated')
    }
    return this.output()
  }
}

module.exports = SimpleGetter

},{"./BaseGetter":27}],33:[function(require,module,exports){

const PropertyWatcher = require('../watchers/PropertyWatcher')

class BaseSetter {
  constructor (prop) {
    this.prop = prop
  }

  init () {
    this.setDefaultValue()
  }

  setDefaultValue () {
    this.setRawValue(this.ingest(this.prop.options.default))
  }

  loadInternalWatcher () {
    const changeOpt = this.prop.options.change
    if (typeof changeOpt === 'function') {
      return new PropertyWatcher({
        property: this.prop,
        callback: changeOpt,
        scope: this.prop.options.scope,
        autoBind: true
      })
    } else if (changeOpt != null && typeof changeOpt.copyWith === 'function') {
      return changeOpt.copyWith({
        property: this.prop,
        autoBind: true
      })
    }
  }

  set (val) {
    throw new Error('Not implemented')
  }

  setRawValue (val) {
    this.prop.value = val
    return this.prop.value
  }

  ingest (val) {
    if (typeof this.prop.options.ingest === 'function') {
      val = this.prop.callOptionFunct('ingest', val)
    }
    return val
  }

  checkChanges (val, old) {
    return val !== old
  }

  changed (old) {
    this.prop.events.emit('updated', old)
    this.prop.events.emit('changed', old)
    return this
  }

  /**
   * @param {PropertyDescriptorMap} opt
   * @return {PropertyDescriptorMap}
   */
  getScopeGetterSetters (opt) {
    const prop = this.prop
    opt[this.prop.options.name] = opt[this.prop.options.name] || {}
    opt[this.prop.options.name].set = function (val) {
      return prop.set(val)
    }
    return opt
  }
}

module.exports = BaseSetter

},{"../watchers/PropertyWatcher":39}],34:[function(require,module,exports){
const BaseSetter = require('./BaseSetter')

class BaseValueSetter extends BaseSetter {
  set (val) {
    val = this.ingest(val)
    if (this.prop.getter.baseValue !== val) {
      this.prop.getter.baseValue = val
      this.prop.invalidate()
    }
    return this
  }
}

module.exports = BaseValueSetter

},{"./BaseSetter":33}],35:[function(require,module,exports){
const SimpleSetter = require('./SimpleSetter')
const Collection = require('spark-collection')
const CollectionPropertyWatcher = require('../watchers/CollectionPropertyWatcher')

class CollectionSetter extends SimpleSetter {
  init () {
    this.options = Object.assign(
      {},
      CollectionSetter.defaultOptions,
      typeof this.prop.options.collection === 'object' ? this.prop.options.collection : {}
    )
    super.init()
  }

  loadInternalWatcher () {
    if (
      typeof this.prop.options.change === 'function' ||
      typeof this.prop.options.itemAdded === 'function' ||
      typeof this.prop.options.itemRemoved === 'function'
    ) {
      return new CollectionPropertyWatcher({
        property: this.prop,
        callback: this.prop.options.change,
        onAdded: this.prop.options.itemAdded,
        onRemoved: this.prop.options.itemRemoved,
        scope: this.prop.options.scope,
        autoBind: true
      })
    } else {
      super.loadInternalWatcher()
    }
  }

  setRawValue (val) {
    this.prop.value = this.makeCollection(val)
    return this.prop.value
  }

  makeCollection (val) {
    val = this.valToArray(val)
    const prop = this.prop
    const col = Collection.newSubClass(this.options, val)
    col.changed = function (old) {
      prop.setter.changed(old)
    }
    return col
  }

  valToArray (val) {
    if (val == null) {
      return []
    } else if (typeof val.toArray === 'function') {
      return val.toArray()
    } else if (Array.isArray(val)) {
      return val.slice()
    } else {
      return [val]
    }
  }

  checkChanges (val, old) {
    var compareFunction
    if (typeof this.options.compare === 'function') {
      compareFunction = this.options.compare
    }
    return (new Collection(val)).checkChanges(old, this.options.ordered, compareFunction)
  }
}

CollectionSetter.defaultOptions = {
  compare: false,
  ordered: true
}

module.exports = CollectionSetter

},{"../watchers/CollectionPropertyWatcher":38,"./SimpleSetter":37,"spark-collection":22}],36:[function(require,module,exports){
const BaseSetter = require('./BaseSetter')

class ManualSetter extends BaseSetter {
  set (val) {
    this.prop.callOptionFunct('set', val)
  }
}

module.exports = ManualSetter

},{"./BaseSetter":33}],37:[function(require,module,exports){
const BaseSetter = require('./BaseSetter')

class SimpleSetter extends BaseSetter {
  set (val) {
    var old
    val = this.ingest(val)
    this.prop.getter.revalidated()
    if (this.checkChanges(val, this.prop.value)) {
      old = this.prop.value
      this.setRawValue(val)
      this.prop.manual = true
      this.changed(old)
    }
    return this
  }
}

module.exports = SimpleSetter

},{"./BaseSetter":33}],38:[function(require,module,exports){

const PropertyWatcher = require('./PropertyWatcher')

class CollectionPropertyWatcher extends PropertyWatcher {
  loadOptions (options) {
    super.loadOptions(options)
    this.onAdded = options.onAdded
    this.onRemoved = options.onRemoved
  }

  handleChange (value, old) {
    old = value.copy(old || [])
    if (typeof this.callback === 'function') {
      this.callback.call(this.scope, value, old)
    }
    if (typeof this.onAdded === 'function') {
      value.forEach((item, i) => {
        if (!old.includes(item)) {
          return this.onAdded.call(this.scope, item)
        }
      })
    }
    if (typeof this.onRemoved === 'function') {
      return old.forEach((item, i) => {
        if (!value.includes(item)) {
          return this.onRemoved.call(this.scope, item)
        }
      })
    }
  }
}

module.exports = CollectionPropertyWatcher

},{"./PropertyWatcher":39}],39:[function(require,module,exports){

const Binder = require('spark-binding').Binder
const Reference = require('spark-binding').Reference

/**
 * @template T
 */
class PropertyWatcher extends Binder {
  /**
   * @typedef {Object} PropertyWatcherOptions
   * @property {import("./Property")<T>|string} property
   * @property {function(T,T)} callback
   * @property {boolean} [autoBind]
   * @property {*} [scope]
   *
   * @param {PropertyWatcherOptions} options
   */
  constructor (options) {
    super()
    this.options = options
    this.invalidateCallback = () => {
      return this.invalidate()
    }
    this.updateCallback = (old) => {
      return this.update(old)
    }
    if (this.options != null) {
      this.loadOptions(this.options)
    }
    this.init()
  }

  loadOptions (options) {
    this.scope = options.scope
    this.property = options.property
    this.callback = options.callback
    this.autoBind = options.autoBind
    return this
  }

  copyWith (options) {
    return new this.constructor(Object.assign({}, this.options, options))
  }

  init () {
    if (this.autoBind) {
      return this.checkBind()
    }
  }

  getProperty () {
    if (typeof this.property === 'string') {
      return this.getPropByName(this.property)
    }
    return this.property
  }

  getPropByName (prop, target = this.scope) {
    if (target.propertiesManager != null) {
      return target.propertiesManager.getProperty(prop)
    } else if (target[prop + 'Property'] != null) {
      return target[prop + 'Property']
    } else {
      throw new Error(`Could not find the property ${prop}`)
    }
  }

  checkBind () {
    return this.toggleBind(this.shouldBind())
  }

  shouldBind () {
    return true
  }

  canBind () {
    return this.getProperty() != null
  }

  doBind () {
    this.update()
    this.getProperty().events.on('invalidated', this.invalidateCallback)
    return this.getProperty().events.on('updated', this.updateCallback)
  }

  doUnbind () {
    this.getProperty().events.off('invalidated', this.invalidateCallback)
    return this.getProperty().events.off('updated', this.updateCallback)
  }

  equals (watcher) {
    return watcher.constructor === this.constructor &&
      watcher != null &&
      watcher.event === this.event &&
      watcher.getProperty() === this.getProperty() &&
      Reference.compareVal(watcher.callback, this.callback)
  }

  invalidate () {
    return this.getProperty().get()
  }

  update (old) {
    var value
    value = this.getProperty().get()
    return this.handleChange(value, old)
  }

  handleChange (value, old) {
    return this.callback.call(this.scope, value, old)
  }
};

module.exports = PropertyWatcher

},{"spark-binding":18}]},{},[15])(15)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9zcGFyay1iaW5kaW5nL2luZGV4LmpzIiwiLi4vc3BhcmstYmluZGluZy9zcmMvQmluZGVyLmpzIiwiLi4vc3BhcmstYmluZGluZy9zcmMvRXZlbnRCaW5kLmpzIiwiLi4vc3BhcmstYmluZGluZy9zcmMvUmVmZXJlbmNlLmpzIiwiLi4vc3BhcmstY29sbGVjdGlvbi9pbmRleC5qcyIsIi4uL3NwYXJrLWNvbGxlY3Rpb24vc3JjL0NvbGxlY3Rpb24uanMiLCJsaWIvRWxlbWVudC5qcyIsImxpYi9JbnZhbGlkYXRlZC9BY3RpdmFibGVQcm9wZXJ0eVdhdGNoZXIuanMiLCJsaWIvSW52YWxpZGF0ZWQvSW52YWxpZGF0ZWQuanMiLCJsaWIvTG9hZGVyLmpzIiwibGliL01peGFibGUuanMiLCJsaWIvT3ZlcnJpZGVyLmpzIiwibGliL1VwZGF0ZXIuanMiLCJsaWIvbGlicy5qcyIsImxpYi9zcGFyay1zdGFydGVyLmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCJub2RlX21vZHVsZXMvc3BhcmstcHJvcGVydGllcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1wcm9wZXJ0aWVzL3NyYy9JbnZhbGlkYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1wcm9wZXJ0aWVzL3NyYy9Qcm9wZXJ0aWVzTWFuYWdlci5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1wcm9wZXJ0aWVzL3NyYy9Qcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1wcm9wZXJ0aWVzL3NyYy9nZXR0ZXJzL0Jhc2VHZXR0ZXIuanMiLCJub2RlX21vZHVsZXMvc3BhcmstcHJvcGVydGllcy9zcmMvZ2V0dGVycy9DYWxjdWxhdGVkR2V0dGVyLmpzIiwibm9kZV9tb2R1bGVzL3NwYXJrLXByb3BlcnRpZXMvc3JjL2dldHRlcnMvQ29tcG9zaXRlR2V0dGVyLmpzIiwibm9kZV9tb2R1bGVzL3NwYXJrLXByb3BlcnRpZXMvc3JjL2dldHRlcnMvSW52YWxpZGF0ZWRHZXR0ZXIuanMiLCJub2RlX21vZHVsZXMvc3BhcmstcHJvcGVydGllcy9zcmMvZ2V0dGVycy9NYW51YWxHZXR0ZXIuanMiLCJub2RlX21vZHVsZXMvc3BhcmstcHJvcGVydGllcy9zcmMvZ2V0dGVycy9TaW1wbGVHZXR0ZXIuanMiLCJub2RlX21vZHVsZXMvc3BhcmstcHJvcGVydGllcy9zcmMvc2V0dGVycy9CYXNlU2V0dGVyLmpzIiwibm9kZV9tb2R1bGVzL3NwYXJrLXByb3BlcnRpZXMvc3JjL3NldHRlcnMvQmFzZVZhbHVlU2V0dGVyLmpzIiwibm9kZV9tb2R1bGVzL3NwYXJrLXByb3BlcnRpZXMvc3JjL3NldHRlcnMvQ29sbGVjdGlvblNldHRlci5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1wcm9wZXJ0aWVzL3NyYy9zZXR0ZXJzL01hbnVhbFNldHRlci5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1wcm9wZXJ0aWVzL3NyYy9zZXR0ZXJzL1NpbXBsZVNldHRlci5qcyIsIm5vZGVfbW9kdWxlcy9zcGFyay1wcm9wZXJ0aWVzL3NyYy93YXRjaGVycy9Db2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyLmpzIiwibm9kZV9tb2R1bGVzL3NwYXJrLXByb3BlcnRpZXMvc3JjL3dhdGNoZXJzL1Byb3BlcnR5V2F0Y2hlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNnQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBCaW5kZXI6IHJlcXVpcmUoJy4vc3JjL0JpbmRlcicpLFxuICBFdmVudEJpbmQ6IHJlcXVpcmUoJy4vc3JjL0V2ZW50QmluZCcpLFxuICBSZWZlcmVuY2U6IHJlcXVpcmUoJy4vc3JjL1JlZmVyZW5jZScpXG59XG4iLCJjbGFzcyBCaW5kZXIge1xuICB0b2dnbGVCaW5kICh2YWwgPSAhdGhpcy5iaW5kZWQpIHtcbiAgICBpZiAodmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5iaW5kKClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudW5iaW5kKClcbiAgICB9XG4gIH1cblxuICBiaW5kICgpIHtcbiAgICBpZiAoIXRoaXMuYmluZGVkICYmIHRoaXMuY2FuQmluZCgpKSB7XG4gICAgICB0aGlzLmRvQmluZCgpXG4gICAgfVxuICAgIHRoaXMuYmluZGVkID0gdHJ1ZVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBjYW5CaW5kICgpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgZG9CaW5kICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpXG4gIH1cblxuICB1bmJpbmQgKCkge1xuICAgIGlmICh0aGlzLmJpbmRlZCAmJiB0aGlzLmNhbkJpbmQoKSkge1xuICAgICAgdGhpcy5kb1VuYmluZCgpXG4gICAgfVxuICAgIHRoaXMuYmluZGVkID0gZmFsc2VcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZG9VbmJpbmQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJylcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIHRoaXMudW5iaW5kKClcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCaW5kZXJcbiIsIlxuY29uc3QgQmluZGVyID0gcmVxdWlyZSgnLi9CaW5kZXInKVxuY29uc3QgUmVmZXJlbmNlID0gcmVxdWlyZSgnLi9SZWZlcmVuY2UnKVxuXG5jbGFzcyBFdmVudEJpbmQgZXh0ZW5kcyBCaW5kZXIge1xuICBjb25zdHJ1Y3RvciAoZXZlbnQxLCB0YXJnZXQxLCBjYWxsYmFjaykge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmV2ZW50ID0gZXZlbnQxXG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQxXG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrXG4gIH1cblxuICBjYW5CaW5kICgpIHtcbiAgICByZXR1cm4gKHRoaXMuY2FsbGJhY2sgIT0gbnVsbCkgJiYgKHRoaXMudGFyZ2V0ICE9IG51bGwpXG4gIH1cblxuICBiaW5kVG8gKHRhcmdldCkge1xuICAgIHRoaXMudW5iaW5kKClcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldFxuICAgIHJldHVybiB0aGlzLmJpbmQoKVxuICB9XG5cbiAgZG9CaW5kICgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMudGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5hZGRFdmVudExpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy50YXJnZXQuYWRkTGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldC5hZGRMaXN0ZW5lcih0aGlzLmV2ZW50LCB0aGlzLmNhbGxiYWNrKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMudGFyZ2V0Lm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQub24odGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjaylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBmdW5jdGlvbiB0byBhZGQgZXZlbnQgbGlzdGVuZXJzIHdhcyBmb3VuZCcpXG4gICAgfVxuICB9XG5cbiAgZG9VbmJpbmQgKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy5ldmVudCwgdGhpcy5jYWxsYmFjaylcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnRhcmdldC5yZW1vdmVMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy50YXJnZXQub2ZmID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQub2ZmKHRoaXMuZXZlbnQsIHRoaXMuY2FsbGJhY2spXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZnVuY3Rpb24gdG8gcmVtb3ZlIGV2ZW50IGxpc3RlbmVycyB3YXMgZm91bmQnKVxuICAgIH1cbiAgfVxuXG4gIGVxdWFscyAoZXZlbnRCaW5kKSB7XG4gICAgcmV0dXJuIGV2ZW50QmluZCAhPSBudWxsICYmXG4gICAgICBldmVudEJpbmQuY29uc3RydWN0b3IgPT09IHRoaXMuY29uc3RydWN0b3IgJiZcbiAgICAgIGV2ZW50QmluZC5ldmVudCA9PT0gdGhpcy5ldmVudCAmJlxuICAgICAgUmVmZXJlbmNlLmNvbXBhcmVWYWwoZXZlbnRCaW5kLnRhcmdldCwgdGhpcy50YXJnZXQpICYmXG4gICAgICBSZWZlcmVuY2UuY29tcGFyZVZhbChldmVudEJpbmQuY2FsbGJhY2ssIHRoaXMuY2FsbGJhY2spXG4gIH1cblxuICBzdGF0aWMgY2hlY2tFbWl0dGVyIChlbWl0dGVyLCBmYXRhbCA9IHRydWUpIHtcbiAgICBpZiAodHlwZW9mIGVtaXR0ZXIuYWRkRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgZW1pdHRlci5hZGRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgZW1pdHRlci5vbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2UgaWYgKGZhdGFsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGZ1bmN0aW9uIHRvIGFkZCBldmVudCBsaXN0ZW5lcnMgd2FzIGZvdW5kJylcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50QmluZFxuIiwiY2xhc3MgUmVmZXJlbmNlIHtcbiAgY29uc3RydWN0b3IgKGRhdGEpIHtcbiAgICB0aGlzLmRhdGEgPSBkYXRhXG4gIH1cblxuICBlcXVhbHMgKHJlZikge1xuICAgIHJldHVybiByZWYgIT0gbnVsbCAmJiByZWYuY29uc3RydWN0b3IgPT09IHRoaXMuY29uc3RydWN0b3IgJiYgdGhpcy5jb21wYXJlRGF0YShyZWYuZGF0YSlcbiAgfVxuXG4gIGNvbXBhcmVEYXRhIChkYXRhKSB7XG4gICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBSZWZlcmVuY2UpIHtcbiAgICAgIHJldHVybiB0aGlzLmVxdWFscyhkYXRhKVxuICAgIH1cbiAgICBpZiAodGhpcy5kYXRhID09PSBkYXRhKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBpZiAodGhpcy5kYXRhID09IG51bGwgfHwgZGF0YSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLmRhdGEgPT09ICdvYmplY3QnICYmIHR5cGVvZiBkYXRhID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuZGF0YSkubGVuZ3RoID09PSBPYmplY3Qua2V5cyhkYXRhKS5sZW5ndGggJiYgT2JqZWN0LmtleXMoZGF0YSkuZXZlcnkoKGtleSkgPT4ge1xuICAgICAgICByZXR1cm4gUmVmZXJlbmNlLmNvbXBhcmVWYWwodGhpcy5kYXRhW2tleV0sIGRhdGFba2V5XSlcbiAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiBSZWZlcmVuY2UuY29tcGFyZVZhbCh0aGlzLmRhdGEsIGRhdGEpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHsqfSB2YWwxXG4gICAqIEBwYXJhbSB7Kn0gdmFsMlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgc3RhdGljIGNvbXBhcmVWYWwgKHZhbDEsIHZhbDIpIHtcbiAgICBpZiAodmFsMSA9PT0gdmFsMikge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgaWYgKHZhbDEgPT0gbnVsbCB8fCB2YWwyID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHZhbDEuZXF1YWxzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdmFsMS5lcXVhbHModmFsMilcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWwyLmVxdWFscyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHZhbDIuZXF1YWxzKHZhbDEpXG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbDEpICYmIEFycmF5LmlzQXJyYXkodmFsMikpIHtcbiAgICAgIHJldHVybiB2YWwxLmxlbmd0aCA9PT0gdmFsMi5sZW5ndGggJiYgdmFsMS5ldmVyeSgodmFsLCBpKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBhcmVWYWwodmFsLCB2YWwyW2ldKVxuICAgICAgfSlcbiAgICB9XG4gICAgLy8gaWYgKHR5cGVvZiB2YWwxID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsMiA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyAgIHJldHVybiBPYmplY3Qua2V5cyh2YWwxKS5sZW5ndGggPT09IE9iamVjdC5rZXlzKHZhbDIpLmxlbmd0aCAmJiBPYmplY3Qua2V5cyh2YWwxKS5ldmVyeSgoa2V5KSA9PiB7XG4gICAgLy8gICAgIHJldHVybiB0aGlzLmNvbXBhcmVWYWwodmFsMVtrZXldLCB2YWwyW2tleV0pXG4gICAgLy8gICB9KVxuICAgIC8vIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHN0YXRpYyBtYWtlUmVmZXJyZWQgKG9iaiwgZGF0YSkge1xuICAgIGlmIChkYXRhIGluc3RhbmNlb2YgUmVmZXJlbmNlKSB7XG4gICAgICBvYmoucmVmID0gZGF0YVxuICAgIH0gZWxzZSB7XG4gICAgICBvYmoucmVmID0gbmV3IFJlZmVyZW5jZShkYXRhKVxuICAgIH1cbiAgICBvYmouZXF1YWxzID0gZnVuY3Rpb24gKG9iajIpIHtcbiAgICAgIHJldHVybiBvYmoyICE9IG51bGwgJiYgdGhpcy5yZWYuZXF1YWxzKG9iajIucmVmKVxuICAgIH1cbiAgICByZXR1cm4gb2JqXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUmVmZXJlbmNlXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vc3JjL0NvbGxlY3Rpb24nKVxuIiwiLyoqXG4gKiBAdGVtcGxhdGUgVFxuICovXG5jbGFzcyBDb2xsZWN0aW9uIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbi48VD58QXJyYXkuPFQ+fFR9IFthcnJdXG4gICAqL1xuICBjb25zdHJ1Y3RvciAoYXJyKSB7XG4gICAgaWYgKGFyciAhPSBudWxsKSB7XG4gICAgICBpZiAodHlwZW9mIGFyci50b0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuX2FycmF5ID0gYXJyLnRvQXJyYXkoKVxuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgICAgdGhpcy5fYXJyYXkgPSBhcnJcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2FycmF5ID0gW2Fycl1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYXJyYXkgPSBbXVxuICAgIH1cbiAgfVxuXG4gIGNoYW5nZWQgKCkge31cblxuICAvKipcbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uLjxUPnxBcnJheS48VD59IG9sZFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IG9yZGVyZWRcbiAgICogQHBhcmFtIHtmdW5jdGlvbihULFQpOiBib29sZWFufSBjb21wYXJlRnVuY3Rpb25cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGNoZWNrQ2hhbmdlcyAob2xkLCBvcmRlcmVkID0gdHJ1ZSwgY29tcGFyZUZ1bmN0aW9uID0gbnVsbCkge1xuICAgIGlmIChjb21wYXJlRnVuY3Rpb24gPT0gbnVsbCkge1xuICAgICAgY29tcGFyZUZ1bmN0aW9uID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEgPT09IGJcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9sZCAhPSBudWxsKSB7XG4gICAgICBvbGQgPSB0aGlzLmNvcHkob2xkLnNsaWNlKCkpXG4gICAgfSBlbHNlIHtcbiAgICAgIG9sZCA9IFtdXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvdW50KCkgIT09IG9sZC5sZW5ndGggfHwgKG9yZGVyZWQgPyB0aGlzLnNvbWUoZnVuY3Rpb24gKHZhbCwgaSkge1xuICAgICAgcmV0dXJuICFjb21wYXJlRnVuY3Rpb24ob2xkLmdldChpKSwgdmFsKVxuICAgIH0pIDogdGhpcy5zb21lKGZ1bmN0aW9uIChhKSB7XG4gICAgICByZXR1cm4gIW9sZC5wbHVjayhmdW5jdGlvbiAoYikge1xuICAgICAgICByZXR1cm4gY29tcGFyZUZ1bmN0aW9uKGEsIGIpXG4gICAgICB9KVxuICAgIH0pKVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpXG4gICAqIEByZXR1cm4ge1R9XG4gICAqL1xuICBnZXQgKGkpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbaV1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtUfVxuICAgKi9cbiAgZ2V0UmFuZG9tICgpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5fYXJyYXkubGVuZ3RoKV1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gaVxuICAgKiBAcGFyYW0ge1R9IHZhbFxuICAgKiBAcmV0dXJuIHtUfVxuICAgKi9cbiAgc2V0IChpLCB2YWwpIHtcbiAgICB2YXIgb2xkXG4gICAgaWYgKHRoaXMuX2FycmF5W2ldICE9PSB2YWwpIHtcbiAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpXG4gICAgICB0aGlzLl9hcnJheVtpXSA9IHZhbFxuICAgICAgdGhpcy5jaGFuZ2VkKG9sZClcbiAgICB9XG4gICAgcmV0dXJuIHZhbFxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7VH0gdmFsXG4gICAqL1xuICBhZGQgKHZhbCkge1xuICAgIGlmICghdGhpcy5fYXJyYXkuaW5jbHVkZXModmFsKSkge1xuICAgICAgcmV0dXJuIHRoaXMucHVzaCh2YWwpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtUfSB2YWxcbiAgICovXG4gIHJlbW92ZSAodmFsKSB7XG4gICAgdmFyIGluZGV4LCBvbGRcbiAgICBpbmRleCA9IHRoaXMuX2FycmF5LmluZGV4T2YodmFsKVxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIG9sZCA9IHRoaXMudG9BcnJheSgpXG4gICAgICB0aGlzLl9hcnJheS5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICB0aGlzLmNoYW5nZWQob2xkKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oVCk6IGJvb2xlYW59IGZuXG4gICAqIEByZXR1cm4ge1R9XG4gICAqL1xuICBwbHVjayAoZm4pIHtcbiAgICB2YXIgZm91bmQsIGluZGV4LCBvbGRcbiAgICBpbmRleCA9IHRoaXMuX2FycmF5LmZpbmRJbmRleChmbilcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgb2xkID0gdGhpcy50b0FycmF5KClcbiAgICAgIGZvdW5kID0gdGhpcy5fYXJyYXlbaW5kZXhdXG4gICAgICB0aGlzLl9hcnJheS5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICB0aGlzLmNoYW5nZWQob2xkKVxuICAgICAgcmV0dXJuIGZvdW5kXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge0FycmF5LjxUPn1cbiAgICovXG4gIHRvQXJyYXkgKCkge1xuICAgIHJldHVybiB0aGlzLl9hcnJheS5zbGljZSgpXG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgY291bnQgKCkge1xuICAgIHJldHVybiB0aGlzLl9hcnJheS5sZW5ndGhcbiAgfVxuXG4gIC8qKlxuICAgKiBAdGVtcGxhdGUgSXRlbVR5cGVcbiAgICogQHBhcmFtIHtPYmplY3R9IHRvQXBwZW5kXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbi48SXRlbVR5cGU+fEFycmF5LjxJdGVtVHlwZT58SXRlbVR5cGV9IFthcnJdXG4gICAqIEByZXR1cm4ge0NvbGxlY3Rpb24uPEl0ZW1UeXBlPn1cbiAgICovXG4gIHN0YXRpYyBuZXdTdWJDbGFzcyAodG9BcHBlbmQsIGFycikge1xuICAgIHZhciBTdWJDbGFzc1xuICAgIGlmICh0eXBlb2YgdG9BcHBlbmQgPT09ICdvYmplY3QnKSB7XG4gICAgICBTdWJDbGFzcyA9IGNsYXNzIGV4dGVuZHMgdGhpcyB7fVxuICAgICAgT2JqZWN0LmFzc2lnbihTdWJDbGFzcy5wcm90b3R5cGUsIHRvQXBwZW5kKVxuICAgICAgcmV0dXJuIG5ldyBTdWJDbGFzcyhhcnIpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgdGhpcyhhcnIpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbi48VD58QXJyYXkuPFQ+fFR9IFthcnJdXG4gICAqIEByZXR1cm4ge0NvbGxlY3Rpb24uPFQ+fVxuICAgKi9cbiAgY29weSAoYXJyKSB7XG4gICAgdmFyIGNvbGxcbiAgICBpZiAoYXJyID09IG51bGwpIHtcbiAgICAgIGFyciA9IHRoaXMudG9BcnJheSgpXG4gICAgfVxuICAgIGNvbGwgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihhcnIpXG4gICAgcmV0dXJuIGNvbGxcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyp9IGFyclxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgZXF1YWxzIChhcnIpIHtcbiAgICByZXR1cm4gKHRoaXMuY291bnQoKSA9PT0gKHR5cGVvZiBhcnIuY291bnQgPT09ICdmdW5jdGlvbicgPyBhcnIuY291bnQoKSA6IGFyci5sZW5ndGgpKSAmJiB0aGlzLmV2ZXJ5KGZ1bmN0aW9uICh2YWwsIGkpIHtcbiAgICAgIHJldHVybiBhcnJbaV0gPT09IHZhbFxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uLjxUPnxBcnJheS48VD59IGFyclxuICAgKiBAcmV0dXJuIHtBcnJheS48VD59XG4gICAqL1xuICBnZXRBZGRlZEZyb20gKGFycikge1xuICAgIHJldHVybiB0aGlzLl9hcnJheS5maWx0ZXIoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHJldHVybiAhYXJyLmluY2x1ZGVzKGl0ZW0pXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0NvbGxlY3Rpb24uPFQ+fEFycmF5LjxUPn0gYXJyXG4gICAqIEByZXR1cm4ge0FycmF5LjxUPn1cbiAgICovXG4gIGdldFJlbW92ZWRGcm9tIChhcnIpIHtcbiAgICByZXR1cm4gYXJyLmZpbHRlcigoaXRlbSkgPT4ge1xuICAgICAgcmV0dXJuICF0aGlzLmluY2x1ZGVzKGl0ZW0pXG4gICAgfSlcbiAgfVxufTtcblxuQ29sbGVjdGlvbi5yZWFkRnVuY3Rpb25zID0gWydldmVyeScsICdmaW5kJywgJ2ZpbmRJbmRleCcsICdmb3JFYWNoJywgJ2luY2x1ZGVzJywgJ2luZGV4T2YnLCAnam9pbicsICdsYXN0SW5kZXhPZicsICdtYXAnLCAncmVkdWNlJywgJ3JlZHVjZVJpZ2h0JywgJ3NvbWUnLCAndG9TdHJpbmcnXVxuXG5Db2xsZWN0aW9uLnJlYWRMaXN0RnVuY3Rpb25zID0gWydjb25jYXQnLCAnZmlsdGVyJywgJ3NsaWNlJ11cblxuQ29sbGVjdGlvbi53cml0ZWZ1bmN0aW9ucyA9IFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICdzb3J0JywgJ3NwbGljZScsICd1bnNoaWZ0J11cblxuQ29sbGVjdGlvbi5yZWFkRnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGZ1bmN0KSB7XG4gIENvbGxlY3Rpb24ucHJvdG90eXBlW2Z1bmN0XSA9IGZ1bmN0aW9uICguLi5hcmcpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbZnVuY3RdKC4uLmFyZylcbiAgfVxufSlcblxuQ29sbGVjdGlvbi5yZWFkTGlzdEZ1bmN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChmdW5jdCkge1xuICBDb2xsZWN0aW9uLnByb3RvdHlwZVtmdW5jdF0gPSBmdW5jdGlvbiAoLi4uYXJnKSB7XG4gICAgcmV0dXJuIHRoaXMuY29weSh0aGlzLl9hcnJheVtmdW5jdF0oLi4uYXJnKSlcbiAgfVxufSlcblxuQ29sbGVjdGlvbi53cml0ZWZ1bmN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChmdW5jdCkge1xuICBDb2xsZWN0aW9uLnByb3RvdHlwZVtmdW5jdF0gPSBmdW5jdGlvbiAoLi4uYXJnKSB7XG4gICAgdmFyIG9sZCwgcmVzXG4gICAgb2xkID0gdGhpcy50b0FycmF5KClcbiAgICByZXMgPSB0aGlzLl9hcnJheVtmdW5jdF0oLi4uYXJnKVxuICAgIHRoaXMuY2hhbmdlZChvbGQpXG4gICAgcmV0dXJuIHJlc1xuICB9XG59KVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQ29sbGVjdGlvbi5wcm90b3R5cGUsICdsZW5ndGgnLCB7XG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmNvdW50KClcbiAgfVxufSlcblxuaWYgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbCAhPT0gbnVsbCA/IFN5bWJvbC5pdGVyYXRvciA6IDApIHtcbiAgQ29sbGVjdGlvbi5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fYXJyYXlbU3ltYm9sLml0ZXJhdG9yXSgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uXG4iLCJ2YXIgRWxlbWVudCwgTWl4YWJsZSwgUHJvcGVydGllc01hbmFnZXI7XG5cblByb3BlcnRpZXNNYW5hZ2VyID0gcmVxdWlyZSgnc3BhcmstcHJvcGVydGllcycpLlByb3BlcnRpZXNNYW5hZ2VyO1xuXG5NaXhhYmxlID0gcmVxdWlyZSgnLi9NaXhhYmxlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRWxlbWVudCA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgRWxlbWVudCBleHRlbmRzIE1peGFibGUge1xuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLmluaXRQcm9wZXJ0aWVzTWFuYWdlcihkYXRhKTtcbiAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cblxuICAgIGluaXRQcm9wZXJ0aWVzTWFuYWdlcihkYXRhKSB7XG4gICAgICB0aGlzLnByb3BlcnRpZXNNYW5hZ2VyID0gdGhpcy5wcm9wZXJ0aWVzTWFuYWdlci51c2VTY29wZSh0aGlzKTtcbiAgICAgIHRoaXMucHJvcGVydGllc01hbmFnZXIuaW5pdFByb3BlcnRpZXMoKTtcbiAgICAgIHRoaXMucHJvcGVydGllc01hbmFnZXIuY3JlYXRlU2NvcGVHZXR0ZXJTZXR0ZXJzKCk7XG4gICAgICBpZiAodHlwZW9mIGRhdGEgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdGhpcy5wcm9wZXJ0aWVzTWFuYWdlci5zZXRQcm9wZXJ0aWVzRGF0YShkYXRhKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0YXAobmFtZSkge1xuICAgICAgdmFyIGFyZ3M7XG4gICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBuYW1lLmFwcGx5KHRoaXMsIGFyZ3Muc2xpY2UoMSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpc1tuYW1lXS5hcHBseSh0aGlzLCBhcmdzLnNsaWNlKDEpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNhbGxiYWNrKG5hbWUpIHtcbiAgICAgIGlmICh0aGlzLl9jYWxsYmFja3MgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9jYWxsYmFja3MgPSB7fTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9jYWxsYmFja3NbbmFtZV0gPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9jYWxsYmFja3NbbmFtZV0gPSAoLi4uYXJncykgPT4ge1xuICAgICAgICAgIHRoaXNbbmFtZV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX2NhbGxiYWNrc1tuYW1lXS5vd25lciA9IHRoaXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fY2FsbGJhY2tzW25hbWVdO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzTWFuYWdlci5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgZ2V0RmluYWxQcm9wZXJ0aWVzKCkge1xuICAgICAgcmV0dXJuIFsncHJvcGVydGllc01hbmFnZXInXTtcbiAgICB9XG5cbiAgICBleHRlbmRlZCh0YXJnZXQpIHtcbiAgICAgIGlmICh0YXJnZXQucHJvcGVydGllc01hbmFnZXIpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5wcm9wZXJ0aWVzTWFuYWdlciA9IHRhcmdldC5wcm9wZXJ0aWVzTWFuYWdlci5jb3B5V2l0aCh0aGlzLnByb3BlcnRpZXNNYW5hZ2VyLnByb3BlcnRpZXNPcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0YXJnZXQucHJvcGVydGllc01hbmFnZXIgPSB0aGlzLnByb3BlcnRpZXNNYW5hZ2VyO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBwcm9wZXJ0eShwcm9wLCBkZXNjKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm90b3R5cGUucHJvcGVydGllc01hbmFnZXIgPSB0aGlzLnByb3RvdHlwZS5wcm9wZXJ0aWVzTWFuYWdlci53aXRoUHJvcGVydHkocHJvcCwgZGVzYyk7XG4gICAgfVxuXG4gICAgc3RhdGljIHByb3BlcnRpZXMocHJvcGVydGllcykge1xuICAgICAgcmV0dXJuIHRoaXMucHJvdG90eXBlLnByb3BlcnRpZXNNYW5hZ2VyID0gdGhpcy5wcm90b3R5cGUucHJvcGVydGllc01hbmFnZXIuY29weVdpdGgocHJvcGVydGllcyk7XG4gICAgfVxuXG4gIH07XG5cbiAgRWxlbWVudC5wcm90b3R5cGUucHJvcGVydGllc01hbmFnZXIgPSBuZXcgUHJvcGVydGllc01hbmFnZXIoKTtcblxuICByZXR1cm4gRWxlbWVudDtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9FbGVtZW50LmpzLm1hcFxuIiwidmFyIEFjdGl2YWJsZVByb3BlcnR5V2F0Y2hlciwgSW52YWxpZGF0b3IsIFByb3BlcnR5V2F0Y2hlcjtcblxuUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnc3BhcmstcHJvcGVydGllcycpLndhdGNoZXJzLlByb3BlcnR5V2F0Y2hlcjtcblxuSW52YWxpZGF0b3IgPSByZXF1aXJlKCdzcGFyay1wcm9wZXJ0aWVzJykuSW52YWxpZGF0b3I7XG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyID0gY2xhc3MgQWN0aXZhYmxlUHJvcGVydHlXYXRjaGVyIGV4dGVuZHMgUHJvcGVydHlXYXRjaGVyIHtcbiAgbG9hZE9wdGlvbnMob3B0aW9ucykge1xuICAgIHN1cGVyLmxvYWRPcHRpb25zKG9wdGlvbnMpO1xuICAgIHJldHVybiB0aGlzLmFjdGl2ZSA9IG9wdGlvbnMuYWN0aXZlO1xuICB9XG5cbiAgc2hvdWxkQmluZCgpIHtcbiAgICB2YXIgYWN0aXZlO1xuICAgIGlmICh0aGlzLmFjdGl2ZSAhPSBudWxsKSB7XG4gICAgICBpZiAodGhpcy5pbnZhbGlkYXRvciA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IgPSBuZXcgSW52YWxpZGF0b3IodGhpcywgdGhpcy5zY29wZSk7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IuY2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2tCaW5kKCk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICB0aGlzLmludmFsaWRhdG9yLnJlY3ljbGUoKTtcbiAgICAgIGFjdGl2ZSA9IHRoaXMuYWN0aXZlKHRoaXMuaW52YWxpZGF0b3IpO1xuICAgICAgdGhpcy5pbnZhbGlkYXRvci5lbmRSZWN5Y2xlKCk7XG4gICAgICB0aGlzLmludmFsaWRhdG9yLmJpbmQoKTtcbiAgICAgIHJldHVybiBhY3RpdmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD0uLi9tYXBzL0ludmFsaWRhdGVkL0FjdGl2YWJsZVByb3BlcnR5V2F0Y2hlci5qcy5tYXBcbiIsInZhciBJbnZhbGlkYXRlZCwgSW52YWxpZGF0b3I7XG5cbkludmFsaWRhdG9yID0gcmVxdWlyZSgnc3BhcmstcHJvcGVydGllcycpLkludmFsaWRhdG9yO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludmFsaWRhdGVkID0gY2xhc3MgSW52YWxpZGF0ZWQge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5sb2FkT3B0aW9ucyhvcHRpb25zKTtcbiAgICB9XG4gICAgaWYgKCEoKG9wdGlvbnMgIT0gbnVsbCA/IG9wdGlvbnMuaW5pdEJ5TG9hZGVyIDogdm9pZCAwKSAmJiAob3B0aW9ucy5sb2FkZXIgIT0gbnVsbCkpKSB7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG4gIH1cblxuICBsb2FkT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgdGhpcy5zY29wZSA9IG9wdGlvbnMuc2NvcGU7XG4gICAgaWYgKG9wdGlvbnMubG9hZGVyQXNTY29wZSAmJiAob3B0aW9ucy5sb2FkZXIgIT0gbnVsbCkpIHtcbiAgICAgIHRoaXMuc2NvcGUgPSBvcHRpb25zLmxvYWRlcjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2sgPSBvcHRpb25zLmNhbGxiYWNrO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICByZXR1cm4gdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIHVua25vd24oKSB7XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IudmFsaWRhdGVVbmtub3ducygpO1xuICB9XG5cbiAgaW52YWxpZGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICBpZiAodGhpcy5pbnZhbGlkYXRvciA9PSBudWxsKSB7XG4gICAgICB0aGlzLmludmFsaWRhdG9yID0gbmV3IEludmFsaWRhdG9yKHRoaXMsIHRoaXMuc2NvcGUpO1xuICAgIH1cbiAgICB0aGlzLmludmFsaWRhdG9yLnJlY3ljbGUoKTtcbiAgICB0aGlzLmhhbmRsZVVwZGF0ZSh0aGlzLmludmFsaWRhdG9yKTtcbiAgICB0aGlzLmludmFsaWRhdG9yLmVuZFJlY3ljbGUoKTtcbiAgICB0aGlzLmludmFsaWRhdG9yLmJpbmQoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGhhbmRsZVVwZGF0ZShpbnZhbGlkYXRvcikge1xuICAgIGlmICh0aGlzLnNjb3BlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLmNhbGxiYWNrLmNhbGwodGhpcy5zY29wZSwgaW52YWxpZGF0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5jYWxsYmFjayhpbnZhbGlkYXRvcik7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5pbnZhbGlkYXRvcikge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0b3IudW5iaW5kKCk7XG4gICAgfVxuICB9XG5cbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPS4uL21hcHMvSW52YWxpZGF0ZWQvSW52YWxpZGF0ZWQuanMubWFwXG4iLCJ2YXIgTG9hZGVyLCBPdmVycmlkZXI7XG5cbk92ZXJyaWRlciA9IHJlcXVpcmUoJy4vT3ZlcnJpZGVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gTG9hZGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBMb2FkZXIgZXh0ZW5kcyBPdmVycmlkZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIHRoaXMuaW5pdFByZWxvYWRlZCgpO1xuICAgIH1cblxuICAgIGluaXRQcmVsb2FkZWQoKSB7XG4gICAgICB2YXIgZGVmTGlzdDtcbiAgICAgIGRlZkxpc3QgPSB0aGlzLnByZWxvYWRlZDtcbiAgICAgIHRoaXMucHJlbG9hZGVkID0gW107XG4gICAgICByZXR1cm4gdGhpcy5sb2FkKGRlZkxpc3QpO1xuICAgIH1cblxuICAgIGxvYWQoZGVmTGlzdCkge1xuICAgICAgdmFyIGxvYWRlZCwgdG9Mb2FkO1xuICAgICAgdG9Mb2FkID0gW107XG4gICAgICBsb2FkZWQgPSBkZWZMaXN0Lm1hcCgoZGVmKSA9PiB7XG4gICAgICAgIHZhciBpbnN0YW5jZTtcbiAgICAgICAgaWYgKGRlZi5pbnN0YW5jZSA9PSBudWxsKSB7XG4gICAgICAgICAgZGVmID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBsb2FkZXI6IHRoaXNcbiAgICAgICAgICB9LCBkZWYpO1xuICAgICAgICAgIGluc3RhbmNlID0gTG9hZGVyLmxvYWQoZGVmKTtcbiAgICAgICAgICBkZWYgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIGluc3RhbmNlOiBpbnN0YW5jZVxuICAgICAgICAgIH0sIGRlZik7XG4gICAgICAgICAgaWYgKGRlZi5pbml0QnlMb2FkZXIgJiYgKGluc3RhbmNlLmluaXQgIT0gbnVsbCkpIHtcbiAgICAgICAgICAgIHRvTG9hZC5wdXNoKGluc3RhbmNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlZjtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5wcmVsb2FkZWQgPSB0aGlzLnByZWxvYWRlZC5jb25jYXQobG9hZGVkKTtcbiAgICAgIHJldHVybiB0b0xvYWQuZm9yRWFjaChmdW5jdGlvbihpbnN0YW5jZSkge1xuICAgICAgICByZXR1cm4gaW5zdGFuY2UuaW5pdCgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJlbG9hZChkZWYpIHtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShkZWYpKSB7XG4gICAgICAgIGRlZiA9IFtkZWZdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMucHJlbG9hZGVkID0gKHRoaXMucHJlbG9hZGVkIHx8IFtdKS5jb25jYXQoZGVmKTtcbiAgICB9XG5cbiAgICBkZXN0cm95TG9hZGVkKCkge1xuICAgICAgcmV0dXJuIHRoaXMucHJlbG9hZGVkLmZvckVhY2goZnVuY3Rpb24oZGVmKSB7XG4gICAgICAgIHZhciByZWY7XG4gICAgICAgIHJldHVybiAocmVmID0gZGVmLmluc3RhbmNlKSAhPSBudWxsID8gdHlwZW9mIHJlZi5kZXN0cm95ID09PSBcImZ1bmN0aW9uXCIgPyByZWYuZGVzdHJveSgpIDogdm9pZCAwIDogdm9pZCAwO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0RmluYWxQcm9wZXJ0aWVzKCkge1xuICAgICAgcmV0dXJuIHN1cGVyLmdldEZpbmFsUHJvcGVydGllcygpLmNvbmNhdChbJ3ByZWxvYWRlZCddKTtcbiAgICB9XG5cbiAgICBleHRlbmRlZCh0YXJnZXQpIHtcbiAgICAgIHN1cGVyLmV4dGVuZGVkKHRhcmdldCk7XG4gICAgICBpZiAodGhpcy5wcmVsb2FkZWQpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5wcmVsb2FkZWQgPSAodGFyZ2V0LnByZWxvYWRlZCB8fCBbXSkuY29uY2F0KHRoaXMucHJlbG9hZGVkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgbG9hZE1hbnkoZGVmKSB7XG4gICAgICByZXR1cm4gZGVmLm1hcCgoZCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2FkKGQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGxvYWQoZGVmKSB7XG4gICAgICBpZiAodHlwZW9mIGRlZi50eXBlLmNvcHlXaXRoID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGRlZi50eXBlLmNvcHlXaXRoKGRlZik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IGRlZi50eXBlKGRlZik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIHByZWxvYWQoZGVmKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm90b3R5cGUucHJlbG9hZChkZWYpO1xuICAgIH1cblxuICB9O1xuXG4gIExvYWRlci5wcm90b3R5cGUucHJlbG9hZGVkID0gW107XG5cbiAgTG9hZGVyLm92ZXJyaWRlcyh7XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmluaXQud2l0aG91dExvYWRlcigpO1xuICAgICAgcmV0dXJuIHRoaXMuaW5pdFByZWxvYWRlZCgpO1xuICAgIH0sXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRlc3Ryb3kud2l0aG91dExvYWRlcigpO1xuICAgICAgcmV0dXJuIHRoaXMuZGVzdHJveUxvYWRlZCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIExvYWRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9Mb2FkZXIuanMubWFwXG4iLCJ2YXIgTWl4YWJsZSxcbiAgaW5kZXhPZiA9IFtdLmluZGV4T2Y7XG5cbm1vZHVsZS5leHBvcnRzID0gTWl4YWJsZSA9IChmdW5jdGlvbigpIHtcbiAgY2xhc3MgTWl4YWJsZSB7XG4gICAgc3RhdGljIGV4dGVuZChvYmopIHtcbiAgICAgIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLCB0aGlzKTtcbiAgICAgIGlmIChvYmoucHJvdG90eXBlICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLnByb3RvdHlwZSwgdGhpcy5wcm90b3R5cGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBpbmNsdWRlKG9iaikge1xuICAgICAgcmV0dXJuIHRoaXMuRXh0ZW5zaW9uLm1ha2Uob2JqLCB0aGlzLnByb3RvdHlwZSk7XG4gICAgfVxuXG4gIH07XG5cbiAgTWl4YWJsZS5FeHRlbnNpb24gPSB7XG4gICAgbWFrZU9uY2U6IGZ1bmN0aW9uKHNvdXJjZSwgdGFyZ2V0KSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKCEoKHJlZiA9IHRhcmdldC5leHRlbnNpb25zKSAhPSBudWxsID8gcmVmLmluY2x1ZGVzKHNvdXJjZSkgOiB2b2lkIDApKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1ha2Uoc291cmNlLCB0YXJnZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbWFrZTogZnVuY3Rpb24oc291cmNlLCB0YXJnZXQpIHtcbiAgICAgIHZhciBpLCBsZW4sIG9yaWdpbmFsRmluYWxQcm9wZXJ0aWVzLCBwcm9wLCByZWY7XG4gICAgICByZWYgPSB0aGlzLmdldEV4dGVuc2lvblByb3BlcnRpZXMoc291cmNlLCB0YXJnZXQpO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHByb3AgPSByZWZbaV07XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3AubmFtZSwgcHJvcCk7XG4gICAgICB9XG4gICAgICBpZiAoc291cmNlLmdldEZpbmFsUHJvcGVydGllcyAmJiB0YXJnZXQuZ2V0RmluYWxQcm9wZXJ0aWVzKSB7XG4gICAgICAgIG9yaWdpbmFsRmluYWxQcm9wZXJ0aWVzID0gdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcztcbiAgICAgICAgdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzKCkuY29uY2F0KG9yaWdpbmFsRmluYWxQcm9wZXJ0aWVzLmNhbGwodGhpcykpO1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcyA9IHNvdXJjZS5nZXRGaW5hbFByb3BlcnRpZXMgfHwgdGFyZ2V0LmdldEZpbmFsUHJvcGVydGllcztcbiAgICAgIH1cbiAgICAgIHRhcmdldC5leHRlbnNpb25zID0gKHRhcmdldC5leHRlbnNpb25zIHx8IFtdKS5jb25jYXQoW3NvdXJjZV0pO1xuICAgICAgaWYgKHR5cGVvZiBzb3VyY2UuZXh0ZW5kZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIHNvdXJjZS5leHRlbmRlZCh0YXJnZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYWx3YXlzRmluYWw6IFsnZXh0ZW5kZWQnLCAnZXh0ZW5zaW9ucycsICdfX3N1cGVyX18nLCAnY29uc3RydWN0b3InLCAnZ2V0RmluYWxQcm9wZXJ0aWVzJ10sXG4gICAgZ2V0RXh0ZW5zaW9uUHJvcGVydGllczogZnVuY3Rpb24oc291cmNlLCB0YXJnZXQpIHtcbiAgICAgIHZhciBhbHdheXNGaW5hbCwgcHJvcHMsIHRhcmdldENoYWluO1xuICAgICAgYWx3YXlzRmluYWwgPSB0aGlzLmFsd2F5c0ZpbmFsO1xuICAgICAgdGFyZ2V0Q2hhaW4gPSB0aGlzLmdldFByb3RvdHlwZUNoYWluKHRhcmdldCk7XG4gICAgICBwcm9wcyA9IFtdO1xuICAgICAgdGhpcy5nZXRQcm90b3R5cGVDaGFpbihzb3VyY2UpLmV2ZXJ5KGZ1bmN0aW9uKG9iaikge1xuICAgICAgICB2YXIgZXhjbHVkZTtcbiAgICAgICAgaWYgKCF0YXJnZXRDaGFpbi5pbmNsdWRlcyhvYmopKSB7XG4gICAgICAgICAgZXhjbHVkZSA9IGFsd2F5c0ZpbmFsO1xuICAgICAgICAgIGlmIChzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzICE9IG51bGwpIHtcbiAgICAgICAgICAgIGV4Y2x1ZGUgPSBleGNsdWRlLmNvbmNhdChzb3VyY2UuZ2V0RmluYWxQcm9wZXJ0aWVzKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgZXhjbHVkZSA9IGV4Y2x1ZGUuY29uY2F0KFtcImxlbmd0aFwiLCBcInByb3RvdHlwZVwiLCBcIm5hbWVcIl0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwcm9wcyA9IHByb3BzLmNvbmNhdChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gIXRhcmdldC5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGtleS5zdWJzdHIoMCwgMikgIT09IFwiX19cIiAmJiBpbmRleE9mLmNhbGwoZXhjbHVkZSwga2V5KSA8IDAgJiYgIXByb3BzLmZpbmQoZnVuY3Rpb24ocHJvcCkge1xuICAgICAgICAgICAgICByZXR1cm4gcHJvcC5uYW1lID09PSBrZXk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KS5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICB2YXIgcHJvcDtcbiAgICAgICAgICAgIHByb3AgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwga2V5KTtcbiAgICAgICAgICAgIHByb3AubmFtZSA9IGtleTtcbiAgICAgICAgICAgIHJldHVybiBwcm9wO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcHJvcHM7XG4gICAgfSxcbiAgICBnZXRQcm90b3R5cGVDaGFpbjogZnVuY3Rpb24ob2JqKSB7XG4gICAgICB2YXIgYmFzZVByb3RvdHlwZSwgY2hhaW47XG4gICAgICBjaGFpbiA9IFtdO1xuICAgICAgYmFzZVByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihPYmplY3QpO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY2hhaW4ucHVzaChvYmopO1xuICAgICAgICBpZiAoISgob2JqID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaikpICYmIG9iaiAhPT0gT2JqZWN0ICYmIG9iaiAhPT0gYmFzZVByb3RvdHlwZSkpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGNoYWluO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gTWl4YWJsZTtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9NaXhhYmxlLmpzLm1hcFxuIiwiLy8gdG9kbyA6IFxuLy8gIHNpbXBsaWZpZWQgZm9ybSA6IEB3aXRob3V0TmFtZSBtZXRob2RcbnZhciBPdmVycmlkZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gT3ZlcnJpZGVyID0gKGZ1bmN0aW9uKCkge1xuICBjbGFzcyBPdmVycmlkZXIge1xuICAgIHN0YXRpYyBvdmVycmlkZXMob3ZlcnJpZGVzKSB7XG4gICAgICByZXR1cm4gdGhpcy5PdmVycmlkZS5hcHBseU1hbnkodGhpcy5wcm90b3R5cGUsIHRoaXMubmFtZSwgb3ZlcnJpZGVzKTtcbiAgICB9XG5cbiAgICBnZXRGaW5hbFByb3BlcnRpZXMoKSB7XG4gICAgICBpZiAodGhpcy5fb3ZlcnJpZGVzICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIFsnX292ZXJyaWRlcyddLmNvbmNhdChPYmplY3Qua2V5cyh0aGlzLl9vdmVycmlkZXMpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBleHRlbmRlZCh0YXJnZXQpIHtcbiAgICAgIGlmICh0aGlzLl9vdmVycmlkZXMgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLk92ZXJyaWRlLmFwcGx5TWFueSh0YXJnZXQsIHRoaXMuY29uc3RydWN0b3IubmFtZSwgdGhpcy5fb3ZlcnJpZGVzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmNvbnN0cnVjdG9yID09PSBPdmVycmlkZXIpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5leHRlbmRlZCA9IHRoaXMuZXh0ZW5kZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgT3ZlcnJpZGVyLk92ZXJyaWRlID0ge1xuICAgIG1ha2VNYW55OiBmdW5jdGlvbih0YXJnZXQsIG5hbWVzcGFjZSwgb3ZlcnJpZGVzKSB7XG4gICAgICB2YXIgZm4sIGtleSwgb3ZlcnJpZGUsIHJlc3VsdHM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGtleSBpbiBvdmVycmlkZXMpIHtcbiAgICAgICAgZm4gPSBvdmVycmlkZXNba2V5XTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKG92ZXJyaWRlID0gdGhpcy5tYWtlKHRhcmdldCwgbmFtZXNwYWNlLCBrZXksIGZuKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9LFxuICAgIGFwcGx5TWFueTogZnVuY3Rpb24odGFyZ2V0LCBuYW1lc3BhY2UsIG92ZXJyaWRlcykge1xuICAgICAgdmFyIGtleSwgb3ZlcnJpZGUsIHJlc3VsdHM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGtleSBpbiBvdmVycmlkZXMpIHtcbiAgICAgICAgb3ZlcnJpZGUgPSBvdmVycmlkZXNba2V5XTtcbiAgICAgICAgaWYgKHR5cGVvZiBvdmVycmlkZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgb3ZlcnJpZGUgPSB0aGlzLm1ha2UodGFyZ2V0LCBuYW1lc3BhY2UsIGtleSwgb3ZlcnJpZGUpO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmFwcGx5KHRhcmdldCwgbmFtZXNwYWNlLCBvdmVycmlkZSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfSxcbiAgICBtYWtlOiBmdW5jdGlvbih0YXJnZXQsIG5hbWVzcGFjZSwgZm5OYW1lLCBmbikge1xuICAgICAgdmFyIG92ZXJyaWRlO1xuICAgICAgb3ZlcnJpZGUgPSB7XG4gICAgICAgIGZuOiB7XG4gICAgICAgICAgY3VycmVudDogZm5cbiAgICAgICAgfSxcbiAgICAgICAgbmFtZTogZm5OYW1lXG4gICAgICB9O1xuICAgICAgb3ZlcnJpZGUuZm5bJ3dpdGgnICsgbmFtZXNwYWNlXSA9IGZuO1xuICAgICAgcmV0dXJuIG92ZXJyaWRlO1xuICAgIH0sXG4gICAgZW1wdHlGbjogZnVuY3Rpb24oKSB7fSxcbiAgICBhcHBseTogZnVuY3Rpb24odGFyZ2V0LCBuYW1lc3BhY2UsIG92ZXJyaWRlKSB7XG4gICAgICB2YXIgZm5OYW1lLCBvdmVycmlkZXMsIHJlZiwgcmVmMSwgd2l0aG91dDtcbiAgICAgIGZuTmFtZSA9IG92ZXJyaWRlLm5hbWU7XG4gICAgICBvdmVycmlkZXMgPSB0YXJnZXQuX292ZXJyaWRlcyAhPSBudWxsID8gT2JqZWN0LmFzc2lnbih7fSwgdGFyZ2V0Ll9vdmVycmlkZXMpIDoge307XG4gICAgICB3aXRob3V0ID0gKChyZWYgPSB0YXJnZXQuX292ZXJyaWRlcykgIT0gbnVsbCA/IChyZWYxID0gcmVmW2ZuTmFtZV0pICE9IG51bGwgPyByZWYxLmZuLmN1cnJlbnQgOiB2b2lkIDAgOiB2b2lkIDApIHx8IHRhcmdldFtmbk5hbWVdO1xuICAgICAgb3ZlcnJpZGUgPSBPYmplY3QuYXNzaWduKHt9LCBvdmVycmlkZSk7XG4gICAgICBpZiAob3ZlcnJpZGVzW2ZuTmFtZV0gIT0gbnVsbCkge1xuICAgICAgICBvdmVycmlkZS5mbiA9IE9iamVjdC5hc3NpZ24oe30sIG92ZXJyaWRlc1tmbk5hbWVdLmZuLCBvdmVycmlkZS5mbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdmVycmlkZS5mbiA9IE9iamVjdC5hc3NpZ24oe30sIG92ZXJyaWRlLmZuKTtcbiAgICAgIH1cbiAgICAgIG92ZXJyaWRlLmZuWyd3aXRob3V0JyArIG5hbWVzcGFjZV0gPSB3aXRob3V0IHx8IHRoaXMuZW1wdHlGbjtcbiAgICAgIGlmICh3aXRob3V0ID09IG51bGwpIHtcbiAgICAgICAgb3ZlcnJpZGUubWlzc2luZ1dpdGhvdXQgPSAnd2l0aG91dCcgKyBuYW1lc3BhY2U7XG4gICAgICB9IGVsc2UgaWYgKG92ZXJyaWRlLm1pc3NpbmdXaXRob3V0KSB7XG4gICAgICAgIG92ZXJyaWRlLmZuW292ZXJyaWRlLm1pc3NpbmdXaXRob3V0XSA9IHdpdGhvdXQ7XG4gICAgICB9XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBmbk5hbWUsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBmaW5hbEZuLCBmbiwga2V5LCByZWYyO1xuICAgICAgICAgIGZpbmFsRm4gPSBvdmVycmlkZS5mbi5jdXJyZW50LmJpbmQodGhpcyk7XG4gICAgICAgICAgcmVmMiA9IG92ZXJyaWRlLmZuO1xuICAgICAgICAgIGZvciAoa2V5IGluIHJlZjIpIHtcbiAgICAgICAgICAgIGZuID0gcmVmMltrZXldO1xuICAgICAgICAgICAgZmluYWxGbltrZXldID0gZm4uYmluZCh0aGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMuY29uc3RydWN0b3IucHJvdG90eXBlICE9PSB0aGlzKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgZm5OYW1lLCB7XG4gICAgICAgICAgICAgIHZhbHVlOiBmaW5hbEZuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZpbmFsRm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgb3ZlcnJpZGVzW2ZuTmFtZV0gPSBvdmVycmlkZTtcbiAgICAgIHJldHVybiB0YXJnZXQuX292ZXJyaWRlcyA9IG92ZXJyaWRlcztcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIE92ZXJyaWRlcjtcblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9PdmVycmlkZXIuanMubWFwXG4iLCJ2YXIgQmluZGVyLCBVcGRhdGVyO1xuXG5CaW5kZXIgPSByZXF1aXJlKCdzcGFyay1iaW5kaW5nJykuQmluZGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVwZGF0ZXIgPSBjbGFzcyBVcGRhdGVyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHZhciByZWY7XG4gICAgdGhpcy5jYWxsYmFja3MgPSBbXTtcbiAgICB0aGlzLm5leHQgPSBbXTtcbiAgICB0aGlzLnVwZGF0aW5nID0gZmFsc2U7XG4gICAgaWYgKChvcHRpb25zICE9IG51bGwgPyBvcHRpb25zLmNhbGxiYWNrIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICB0aGlzLmFkZENhbGxiYWNrKG9wdGlvbnMuY2FsbGJhY2spO1xuICAgIH1cbiAgICBpZiAoKG9wdGlvbnMgIT0gbnVsbCA/IChyZWYgPSBvcHRpb25zLmNhbGxiYWNrcykgIT0gbnVsbCA/IHJlZi5mb3JFYWNoIDogdm9pZCAwIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICBvcHRpb25zLmNhbGxiYWNrcy5mb3JFYWNoKChjYWxsYmFjaykgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgdmFyIGNhbGxiYWNrO1xuICAgIHRoaXMudXBkYXRpbmcgPSB0cnVlO1xuICAgIHRoaXMubmV4dCA9IHRoaXMuY2FsbGJhY2tzLnNsaWNlKCk7XG4gICAgd2hpbGUgKHRoaXMuY2FsbGJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNhbGxiYWNrID0gdGhpcy5jYWxsYmFja3Muc2hpZnQoKTtcbiAgICAgIHRoaXMucnVuQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgIH1cbiAgICB0aGlzLmNhbGxiYWNrcyA9IHRoaXMubmV4dDtcbiAgICB0aGlzLnVwZGF0aW5nID0gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBydW5DYWxsYmFjayhjYWxsYmFjaykge1xuICAgIHJldHVybiBjYWxsYmFjaygpO1xuICB9XG5cbiAgYWRkQ2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICBpZiAoIXRoaXMuY2FsbGJhY2tzLmluY2x1ZGVzKGNhbGxiYWNrKSkge1xuICAgICAgdGhpcy5jYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgfVxuICAgIGlmICh0aGlzLnVwZGF0aW5nICYmICF0aGlzLm5leHQuaW5jbHVkZXMoY2FsbGJhY2spKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0LnB1c2goY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIG5leHRUaWNrKGNhbGxiYWNrKSB7XG4gICAgaWYgKHRoaXMudXBkYXRpbmcpIHtcbiAgICAgIGlmICghdGhpcy5uZXh0LmluY2x1ZGVzKGNhbGxiYWNrKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZXh0LnB1c2goY2FsbGJhY2spO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5hZGRDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlQ2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICB2YXIgaW5kZXg7XG4gICAgaW5kZXggPSB0aGlzLmNhbGxiYWNrcy5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICBpbmRleCA9IHRoaXMubmV4dC5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0LnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0QmluZGVyKCkge1xuICAgIHJldHVybiBuZXcgVXBkYXRlci5CaW5kZXIodGhpcyk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2FsbGJhY2tzID0gW107XG4gICAgcmV0dXJuIHRoaXMubmV4dCA9IFtdO1xuICB9XG5cbn07XG5cblVwZGF0ZXIuQmluZGVyID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgY2xhc3MgQmluZGVyIGV4dGVuZHMgc3VwZXJDbGFzcyB7XG4gICAgY29uc3RydWN0b3IodGFyZ2V0LCBjYWxsYmFjazEpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjazE7XG4gICAgfVxuXG4gICAgZ2V0UmVmKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiB0aGlzLnRhcmdldCxcbiAgICAgICAgY2FsbGJhY2s6IHRoaXMuY2FsbGJhY2tcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZG9CaW5kKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LmFkZENhbGxiYWNrKHRoaXMuY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGRvVW5iaW5kKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnJlbW92ZUNhbGxiYWNrKHRoaXMuY2FsbGJhY2spO1xuICAgIH1cblxuICB9O1xuXG4gIHJldHVybiBCaW5kZXI7XG5cbn0pLmNhbGwodGhpcywgQmluZGVyKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFwcy9VcGRhdGVyLmpzLm1hcFxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiRWxlbWVudFwiOiByZXF1aXJlKFwiLi9FbGVtZW50XCIpLFxuICBcIkxvYWRlclwiOiByZXF1aXJlKFwiLi9Mb2FkZXJcIiksXG4gIFwiTWl4YWJsZVwiOiByZXF1aXJlKFwiLi9NaXhhYmxlXCIpLFxuICBcIk92ZXJyaWRlclwiOiByZXF1aXJlKFwiLi9PdmVycmlkZXJcIiksXG4gIFwiVXBkYXRlclwiOiByZXF1aXJlKFwiLi9VcGRhdGVyXCIpLFxuICBcIkludmFsaWRhdGVkXCI6IHtcbiAgICBcIkFjdGl2YWJsZVByb3BlcnR5V2F0Y2hlclwiOiByZXF1aXJlKFwiLi9JbnZhbGlkYXRlZC9BY3RpdmFibGVQcm9wZXJ0eVdhdGNoZXJcIiksXG4gICAgXCJJbnZhbGlkYXRlZFwiOiByZXF1aXJlKFwiLi9JbnZhbGlkYXRlZC9JbnZhbGlkYXRlZFwiKSxcbiAgfSxcbn0iLCJ2YXIgbGlicztcblxubGlicyA9IHJlcXVpcmUoJy4vbGlicycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oe1xuICAnQ29sbGVjdGlvbic6IHJlcXVpcmUoJ3NwYXJrLWNvbGxlY3Rpb24nKVxufSwgbGlicywgcmVxdWlyZSgnc3BhcmstcHJvcGVydGllcycpLCByZXF1aXJlKCdzcGFyay1iaW5kaW5nJykpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBzL3NwYXJrLXN0YXJ0ZXIuanMubWFwXG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIG9iamVjdENyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgb2JqZWN0Q3JlYXRlUG9seWZpbGxcbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgb2JqZWN0S2V5c1BvbHlmaWxsXG52YXIgYmluZCA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kIHx8IGZ1bmN0aW9uQmluZFBvbHlmaWxsXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCAnX2V2ZW50cycpKSB7XG4gICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgfVxuXG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbnZhciBkZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbnZhciBoYXNEZWZpbmVQcm9wZXJ0eTtcbnRyeSB7XG4gIHZhciBvID0ge307XG4gIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCAneCcsIHsgdmFsdWU6IDAgfSk7XG4gIGhhc0RlZmluZVByb3BlcnR5ID0gby54ID09PSAwO1xufSBjYXRjaCAoZXJyKSB7IGhhc0RlZmluZVByb3BlcnR5ID0gZmFsc2UgfVxuaWYgKGhhc0RlZmluZVByb3BlcnR5KSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFdmVudEVtaXR0ZXIsICdkZWZhdWx0TWF4TGlzdGVuZXJzJywge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBkZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbihhcmcpIHtcbiAgICAgIC8vIGNoZWNrIHdoZXRoZXIgdGhlIGlucHV0IGlzIGEgcG9zaXRpdmUgbnVtYmVyICh3aG9zZSB2YWx1ZSBpcyB6ZXJvIG9yXG4gICAgICAvLyBncmVhdGVyIGFuZCBub3QgYSBOYU4pLlxuICAgICAgaWYgKHR5cGVvZiBhcmcgIT09ICdudW1iZXInIHx8IGFyZyA8IDAgfHwgYXJnICE9PSBhcmcpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiZGVmYXVsdE1heExpc3RlbmVyc1wiIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgICAgIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSBhcmc7XG4gICAgfVxuICB9KTtcbn0gZWxzZSB7XG4gIEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gZGVmYXVsdE1heExpc3RlbmVycztcbn1cblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKG4pIHtcbiAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJyB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcIm5cIiBhcmd1bWVudCBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gJGdldE1heExpc3RlbmVycyh0aGF0KSB7XG4gIGlmICh0aGF0Ll9tYXhMaXN0ZW5lcnMgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gIHJldHVybiB0aGF0Ll9tYXhMaXN0ZW5lcnM7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZ2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gZ2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gJGdldE1heExpc3RlbmVycyh0aGlzKTtcbn07XG5cbi8vIFRoZXNlIHN0YW5kYWxvbmUgZW1pdCogZnVuY3Rpb25zIGFyZSB1c2VkIHRvIG9wdGltaXplIGNhbGxpbmcgb2YgZXZlbnRcbi8vIGhhbmRsZXJzIGZvciBmYXN0IGNhc2VzIGJlY2F1c2UgZW1pdCgpIGl0c2VsZiBvZnRlbiBoYXMgYSB2YXJpYWJsZSBudW1iZXIgb2Zcbi8vIGFyZ3VtZW50cyBhbmQgY2FuIGJlIGRlb3B0aW1pemVkIGJlY2F1c2Ugb2YgdGhhdC4gVGhlc2UgZnVuY3Rpb25zIGFsd2F5cyBoYXZlXG4vLyB0aGUgc2FtZSBudW1iZXIgb2YgYXJndW1lbnRzIGFuZCB0aHVzIGRvIG5vdCBnZXQgZGVvcHRpbWl6ZWQsIHNvIHRoZSBjb2RlXG4vLyBpbnNpZGUgdGhlbSBjYW4gZXhlY3V0ZSBmYXN0ZXIuXG5mdW5jdGlvbiBlbWl0Tm9uZShoYW5kbGVyLCBpc0ZuLCBzZWxmKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYpO1xuICB9XG59XG5mdW5jdGlvbiBlbWl0T25lKGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZzEpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYsIGFyZzEpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZiwgYXJnMSk7XG4gIH1cbn1cbmZ1bmN0aW9uIGVtaXRUd28oaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJnMSwgYXJnMikge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZiwgYXJnMSwgYXJnMik7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmLCBhcmcxLCBhcmcyKTtcbiAgfVxufVxuZnVuY3Rpb24gZW1pdFRocmVlKGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZzEsIGFyZzIsIGFyZzMpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYsIGFyZzEsIGFyZzIsIGFyZzMpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZiwgYXJnMSwgYXJnMiwgYXJnMyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZW1pdE1hbnkoaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJncykge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICB9XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQodHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgZXZlbnRzO1xuICB2YXIgZG9FcnJvciA9ICh0eXBlID09PSAnZXJyb3InKTtcblxuICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gIGlmIChldmVudHMpXG4gICAgZG9FcnJvciA9IChkb0Vycm9yICYmIGV2ZW50cy5lcnJvciA9PSBudWxsKTtcbiAgZWxzZSBpZiAoIWRvRXJyb3IpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKGRvRXJyb3IpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpXG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEF0IGxlYXN0IGdpdmUgc29tZSBraW5kIG9mIGNvbnRleHQgdG8gdGhlIHVzZXJcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1VuaGFuZGxlZCBcImVycm9yXCIgZXZlbnQuICgnICsgZXIgKyAnKScpO1xuICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaGFuZGxlciA9IGV2ZW50c1t0eXBlXTtcblxuICBpZiAoIWhhbmRsZXIpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBpc0ZuID0gdHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbic7XG4gIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gIHN3aXRjaCAobGVuKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgY2FzZSAxOlxuICAgICAgZW1pdE5vbmUoaGFuZGxlciwgaXNGbiwgdGhpcyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDI6XG4gICAgICBlbWl0T25lKGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDM6XG4gICAgICBlbWl0VHdvKGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgNDpcbiAgICAgIGVtaXRUaHJlZShoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSwgYXJndW1lbnRzWzNdKTtcbiAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgZGVmYXVsdDpcbiAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgZW1pdE1hbnkoaGFuZGxlciwgaXNGbiwgdGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmZ1bmN0aW9uIF9hZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBwcmVwZW5kKSB7XG4gIHZhciBtO1xuICB2YXIgZXZlbnRzO1xuICB2YXIgZXhpc3Rpbmc7XG5cbiAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG4gIGlmICghZXZlbnRzKSB7XG4gICAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgdGFyZ2V0Ll9ldmVudHNDb3VudCA9IDA7XG4gIH0gZWxzZSB7XG4gICAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gICAgaWYgKGV2ZW50cy5uZXdMaXN0ZW5lcikge1xuICAgICAgdGFyZ2V0LmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA/IGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gICAgICAvLyBSZS1hc3NpZ24gYGV2ZW50c2AgYmVjYXVzZSBhIG5ld0xpc3RlbmVyIGhhbmRsZXIgY291bGQgaGF2ZSBjYXVzZWQgdGhlXG4gICAgICAvLyB0aGlzLl9ldmVudHMgdG8gYmUgYXNzaWduZWQgdG8gYSBuZXcgb2JqZWN0XG4gICAgICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcbiAgICB9XG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV07XG4gIH1cblxuICBpZiAoIWV4aXN0aW5nKSB7XG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgICArK3RhcmdldC5fZXZlbnRzQ291bnQ7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBleGlzdGluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXSA9XG4gICAgICAgICAgcHJlcGVuZCA/IFtsaXN0ZW5lciwgZXhpc3RpbmddIDogW2V4aXN0aW5nLCBsaXN0ZW5lcl07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICAgIGlmIChwcmVwZW5kKSB7XG4gICAgICAgIGV4aXN0aW5nLnVuc2hpZnQobGlzdGVuZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXhpc3RpbmcucHVzaChsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgICBpZiAoIWV4aXN0aW5nLndhcm5lZCkge1xuICAgICAgbSA9ICRnZXRNYXhMaXN0ZW5lcnModGFyZ2V0KTtcbiAgICAgIGlmIChtICYmIG0gPiAwICYmIGV4aXN0aW5nLmxlbmd0aCA+IG0pIHtcbiAgICAgICAgZXhpc3Rpbmcud2FybmVkID0gdHJ1ZTtcbiAgICAgICAgdmFyIHcgPSBuZXcgRXJyb3IoJ1Bvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgbGVhayBkZXRlY3RlZC4gJyArXG4gICAgICAgICAgICBleGlzdGluZy5sZW5ndGggKyAnIFwiJyArIFN0cmluZyh0eXBlKSArICdcIiBsaXN0ZW5lcnMgJyArXG4gICAgICAgICAgICAnYWRkZWQuIFVzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvICcgK1xuICAgICAgICAgICAgJ2luY3JlYXNlIGxpbWl0LicpO1xuICAgICAgICB3Lm5hbWUgPSAnTWF4TGlzdGVuZXJzRXhjZWVkZWRXYXJuaW5nJztcbiAgICAgICAgdy5lbWl0dGVyID0gdGFyZ2V0O1xuICAgICAgICB3LnR5cGUgPSB0eXBlO1xuICAgICAgICB3LmNvdW50ID0gZXhpc3RpbmcubGVuZ3RoO1xuICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgPT09ICdvYmplY3QnICYmIGNvbnNvbGUud2Fybikge1xuICAgICAgICAgIGNvbnNvbGUud2FybignJXM6ICVzJywgdy5uYW1lLCB3Lm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uIGFkZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHJldHVybiBfYWRkTGlzdGVuZXIodGhpcywgdHlwZSwgbGlzdGVuZXIsIGZhbHNlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcHJlcGVuZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCB0cnVlKTtcbiAgICB9O1xuXG5mdW5jdGlvbiBvbmNlV3JhcHBlcigpIHtcbiAgaWYgKCF0aGlzLmZpcmVkKSB7XG4gICAgdGhpcy50YXJnZXQucmVtb3ZlTGlzdGVuZXIodGhpcy50eXBlLCB0aGlzLndyYXBGbik7XG4gICAgdGhpcy5maXJlZCA9IHRydWU7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQpO1xuICAgICAgY2FzZSAxOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0LCBhcmd1bWVudHNbMF0pO1xuICAgICAgY2FzZSAyOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0LCBhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSk7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQsIGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdLFxuICAgICAgICAgICAgYXJndW1lbnRzWzJdKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyArK2kpXG4gICAgICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgdGhpcy5saXN0ZW5lci5hcHBseSh0aGlzLnRhcmdldCwgYXJncyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIF9vbmNlV3JhcCh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBzdGF0ZSA9IHsgZmlyZWQ6IGZhbHNlLCB3cmFwRm46IHVuZGVmaW5lZCwgdGFyZ2V0OiB0YXJnZXQsIHR5cGU6IHR5cGUsIGxpc3RlbmVyOiBsaXN0ZW5lciB9O1xuICB2YXIgd3JhcHBlZCA9IGJpbmQuY2FsbChvbmNlV3JhcHBlciwgc3RhdGUpO1xuICB3cmFwcGVkLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHN0YXRlLndyYXBGbiA9IHdyYXBwZWQ7XG4gIHJldHVybiB3cmFwcGVkO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICB0aGlzLm9uKHR5cGUsIF9vbmNlV3JhcCh0aGlzLCB0eXBlLCBsaXN0ZW5lcikpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucHJlcGVuZE9uY2VMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcHJlcGVuZE9uY2VMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgdGhpcy5wcmVwZW5kTGlzdGVuZXIodHlwZSwgX29uY2VXcmFwKHRoaXMsIHR5cGUsIGxpc3RlbmVyKSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4vLyBFbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWYgYW5kIG9ubHkgaWYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIHZhciBsaXN0LCBldmVudHMsIHBvc2l0aW9uLCBpLCBvcmlnaW5hbExpc3RlbmVyO1xuXG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgICAgIGlmICghZXZlbnRzKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgbGlzdCA9IGV2ZW50c1t0eXBlXTtcbiAgICAgIGlmICghbGlzdClcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fCBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikge1xuICAgICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMClcbiAgICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0Lmxpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbGlzdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwb3NpdGlvbiA9IC0xO1xuXG4gICAgICAgIGZvciAoaSA9IGxpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHwgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIG9yaWdpbmFsTGlzdGVuZXIgPSBsaXN0W2ldLmxpc3RlbmVyO1xuICAgICAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgICBpZiAocG9zaXRpb24gPT09IDApXG4gICAgICAgICAgbGlzdC5zaGlmdCgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgc3BsaWNlT25lKGxpc3QsIHBvc2l0aW9uKTtcblxuICAgICAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpXG4gICAgICAgICAgZXZlbnRzW3R5cGVdID0gbGlzdFswXTtcblxuICAgICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBvcmlnaW5hbExpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyh0eXBlKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzLCBldmVudHMsIGk7XG5cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgICAgIGlmICghZXZlbnRzKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICAgICAgaWYgKCFldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50c1t0eXBlXSkge1xuICAgICAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKVxuICAgICAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdmFyIGtleXMgPSBvYmplY3RLZXlzKGV2ZW50cyk7XG4gICAgICAgIHZhciBrZXk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgICAgICB0aGlzLl9ldmVudHMgPSBvYmplY3RDcmVhdGUobnVsbCk7XG4gICAgICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGxpc3RlbmVycyA9IGV2ZW50c1t0eXBlXTtcblxuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICAgICAgfSBlbHNlIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgICAgLy8gTElGTyBvcmRlclxuICAgICAgICBmb3IgKGkgPSBsaXN0ZW5lcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuZnVuY3Rpb24gX2xpc3RlbmVycyh0YXJnZXQsIHR5cGUsIHVud3JhcCkge1xuICB2YXIgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG5cbiAgaWYgKCFldmVudHMpXG4gICAgcmV0dXJuIFtdO1xuXG4gIHZhciBldmxpc3RlbmVyID0gZXZlbnRzW3R5cGVdO1xuICBpZiAoIWV2bGlzdGVuZXIpXG4gICAgcmV0dXJuIFtdO1xuXG4gIGlmICh0eXBlb2YgZXZsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJylcbiAgICByZXR1cm4gdW53cmFwID8gW2V2bGlzdGVuZXIubGlzdGVuZXIgfHwgZXZsaXN0ZW5lcl0gOiBbZXZsaXN0ZW5lcl07XG5cbiAgcmV0dXJuIHVud3JhcCA/IHVud3JhcExpc3RlbmVycyhldmxpc3RlbmVyKSA6IGFycmF5Q2xvbmUoZXZsaXN0ZW5lciwgZXZsaXN0ZW5lci5sZW5ndGgpO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyh0eXBlKSB7XG4gIHJldHVybiBfbGlzdGVuZXJzKHRoaXMsIHR5cGUsIHRydWUpO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yYXdMaXN0ZW5lcnMgPSBmdW5jdGlvbiByYXdMaXN0ZW5lcnModHlwZSkge1xuICByZXR1cm4gX2xpc3RlbmVycyh0aGlzLCB0eXBlLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgaWYgKHR5cGVvZiBlbWl0dGVyLmxpc3RlbmVyQ291bnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZW1pdHRlci5saXN0ZW5lckNvdW50KHR5cGUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBsaXN0ZW5lckNvdW50LmNhbGwoZW1pdHRlciwgdHlwZSk7XG4gIH1cbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGxpc3RlbmVyQ291bnQ7XG5mdW5jdGlvbiBsaXN0ZW5lckNvdW50KHR5cGUpIHtcbiAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcblxuICBpZiAoZXZlbnRzKSB7XG4gICAgdmFyIGV2bGlzdGVuZXIgPSBldmVudHNbdHlwZV07XG5cbiAgICBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH0gZWxzZSBpZiAoZXZsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiAwO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmV2ZW50TmFtZXMgPSBmdW5jdGlvbiBldmVudE5hbWVzKCkge1xuICByZXR1cm4gdGhpcy5fZXZlbnRzQ291bnQgPiAwID8gUmVmbGVjdC5vd25LZXlzKHRoaXMuX2V2ZW50cykgOiBbXTtcbn07XG5cbi8vIEFib3V0IDEuNXggZmFzdGVyIHRoYW4gdGhlIHR3by1hcmcgdmVyc2lvbiBvZiBBcnJheSNzcGxpY2UoKS5cbmZ1bmN0aW9uIHNwbGljZU9uZShsaXN0LCBpbmRleCkge1xuICBmb3IgKHZhciBpID0gaW5kZXgsIGsgPSBpICsgMSwgbiA9IGxpc3QubGVuZ3RoOyBrIDwgbjsgaSArPSAxLCBrICs9IDEpXG4gICAgbGlzdFtpXSA9IGxpc3Rba107XG4gIGxpc3QucG9wKCk7XG59XG5cbmZ1bmN0aW9uIGFycmF5Q2xvbmUoYXJyLCBuKSB7XG4gIHZhciBjb3B5ID0gbmV3IEFycmF5KG4pO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSlcbiAgICBjb3B5W2ldID0gYXJyW2ldO1xuICByZXR1cm4gY29weTtcbn1cblxuZnVuY3Rpb24gdW53cmFwTGlzdGVuZXJzKGFycikge1xuICB2YXIgcmV0ID0gbmV3IEFycmF5KGFyci5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHJldC5sZW5ndGg7ICsraSkge1xuICAgIHJldFtpXSA9IGFycltpXS5saXN0ZW5lciB8fCBhcnJbaV07XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gb2JqZWN0Q3JlYXRlUG9seWZpbGwocHJvdG8pIHtcbiAgdmFyIEYgPSBmdW5jdGlvbigpIHt9O1xuICBGLnByb3RvdHlwZSA9IHByb3RvO1xuICByZXR1cm4gbmV3IEY7XG59XG5mdW5jdGlvbiBvYmplY3RLZXlzUG9seWZpbGwob2JqKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGsgaW4gb2JqKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgaykpIHtcbiAgICBrZXlzLnB1c2goayk7XG4gIH1cbiAgcmV0dXJuIGs7XG59XG5mdW5jdGlvbiBmdW5jdGlvbkJpbmRQb2x5ZmlsbChjb250ZXh0KSB7XG4gIHZhciBmbiA9IHRoaXM7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZuLmFwcGx5KGNvbnRleHQsIGFyZ3VtZW50cyk7XG4gIH07XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgSW52YWxpZGF0b3I6IHJlcXVpcmUoJy4vc3JjL0ludmFsaWRhdG9yJyksXG4gIFByb3BlcnRpZXNNYW5hZ2VyOiByZXF1aXJlKCcuL3NyYy9Qcm9wZXJ0aWVzTWFuYWdlcicpLFxuICBQcm9wZXJ0eTogcmVxdWlyZSgnLi9zcmMvUHJvcGVydHknKSxcbiAgZ2V0dGVyczoge1xuICAgIEJhc2VHZXR0ZXI6IHJlcXVpcmUoJy4vc3JjL2dldHRlcnMvQmFzZUdldHRlcicpLFxuICAgIENhbGN1bGF0ZWRHZXR0ZXI6IHJlcXVpcmUoJy4vc3JjL2dldHRlcnMvQ2FsY3VsYXRlZEdldHRlcicpLFxuICAgIENvbXBvc2l0ZUdldHRlcjogcmVxdWlyZSgnLi9zcmMvZ2V0dGVycy9Db21wb3NpdGVHZXR0ZXInKSxcbiAgICBJbnZhbGlkYXRlZEdldHRlcjogcmVxdWlyZSgnLi9zcmMvZ2V0dGVycy9JbnZhbGlkYXRlZEdldHRlcicpLFxuICAgIE1hbnVhbEdldHRlcjogcmVxdWlyZSgnLi9zcmMvZ2V0dGVycy9NYW51YWxHZXR0ZXInKSxcbiAgICBTaW1wbGVHZXR0ZXI6IHJlcXVpcmUoJy4vc3JjL2dldHRlcnMvU2ltcGxlR2V0dGVyJylcbiAgfSxcbiAgc2V0dGVyczoge1xuICAgIEJhc2VTZXR0ZXI6IHJlcXVpcmUoJy4vc3JjL3NldHRlcnMvQmFzZVNldHRlcicpLFxuICAgIEJhc2VWYWx1ZVNldHRlcjogcmVxdWlyZSgnLi9zcmMvc2V0dGVycy9CYXNlVmFsdWVTZXR0ZXInKSxcbiAgICBDb2xsZWN0aW9uU2V0dGVyOiByZXF1aXJlKCcuL3NyYy9zZXR0ZXJzL0NvbGxlY3Rpb25TZXR0ZXInKSxcbiAgICBNYW51YWxTZXR0ZXI6IHJlcXVpcmUoJy4vc3JjL3NldHRlcnMvTWFudWFsU2V0dGVyJyksXG4gICAgU2ltcGxlU2V0dGVyOiByZXF1aXJlKCcuL3NyYy9zZXR0ZXJzL1NpbXBsZVNldHRlcicpXG4gIH0sXG4gIHdhdGNoZXJzOiB7XG4gICAgQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlcjogcmVxdWlyZSgnLi9zcmMvd2F0Y2hlcnMvQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlcicpLFxuICAgIFByb3BlcnR5V2F0Y2hlcjogcmVxdWlyZSgnLi9zcmMvd2F0Y2hlcnMvUHJvcGVydHlXYXRjaGVyJylcbiAgfVxufVxuIiwiY29uc3QgQmluZGVyID0gcmVxdWlyZSgnc3BhcmstYmluZGluZycpLkJpbmRlclxuY29uc3QgRXZlbnRCaW5kID0gcmVxdWlyZSgnc3BhcmstYmluZGluZycpLkV2ZW50QmluZFxuXG5jb25zdCBwbHVjayA9IGZ1bmN0aW9uIChhcnIsIGZuKSB7XG4gIHZhciBmb3VuZCwgaW5kZXhcbiAgaW5kZXggPSBhcnIuZmluZEluZGV4KGZuKVxuICBpZiAoaW5kZXggPiAtMSkge1xuICAgIGZvdW5kID0gYXJyW2luZGV4XVxuICAgIGFyci5zcGxpY2UoaW5kZXgsIDEpXG4gICAgcmV0dXJuIGZvdW5kXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxufVxuXG5jbGFzcyBJbnZhbGlkYXRvciBleHRlbmRzIEJpbmRlciB7XG4gIGNvbnN0cnVjdG9yIChpbnZhbGlkYXRlZCwgc2NvcGUgPSBudWxsKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuaW52YWxpZGF0ZWQgPSBpbnZhbGlkYXRlZFxuICAgIHRoaXMuc2NvcGUgPSBzY29wZVxuICAgIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzID0gW11cbiAgICB0aGlzLnJlY3ljbGVkID0gW11cbiAgICB0aGlzLnVua25vd25zID0gW11cbiAgICB0aGlzLnN0cmljdCA9IHRoaXMuY29uc3RydWN0b3Iuc3RyaWN0XG4gICAgdGhpcy5pbnZhbGlkID0gZmFsc2VcbiAgICB0aGlzLmludmFsaWRhdGVDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZSgpXG4gICAgfVxuICAgIHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrLm93bmVyID0gdGhpc1xuICB9XG5cbiAgaW52YWxpZGF0ZSAoKSB7XG4gICAgdmFyIGZ1bmN0TmFtZVxuICAgIHRoaXMuaW52YWxpZCA9IHRydWVcbiAgICBpZiAodHlwZW9mIHRoaXMuaW52YWxpZGF0ZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZWQoKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuY2FsbGJhY2soKVxuICAgIH0gZWxzZSBpZiAoKHRoaXMuaW52YWxpZGF0ZWQgIT0gbnVsbCkgJiYgdHlwZW9mIHRoaXMuaW52YWxpZGF0ZWQuaW52YWxpZGF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5pbnZhbGlkYXRlZC5pbnZhbGlkYXRlKClcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmludmFsaWRhdGVkID09PSAnc3RyaW5nJykge1xuICAgICAgZnVuY3ROYW1lID0gJ2ludmFsaWRhdGUnICsgdGhpcy5pbnZhbGlkYXRlZC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRoaXMuaW52YWxpZGF0ZWQuc2xpY2UoMSlcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5zY29wZVtmdW5jdE5hbWVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuc2NvcGVbZnVuY3ROYW1lXSgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNjb3BlW3RoaXMuaW52YWxpZGF0ZWRdID0gbnVsbFxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgdW5rbm93biAoKSB7XG4gICAgaWYgKHRoaXMuaW52YWxpZGF0ZWQgIT0gbnVsbCAmJiB0eXBlb2YgdGhpcy5pbnZhbGlkYXRlZC51bmtub3duID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRlZC51bmtub3duKClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpXG4gICAgfVxuICB9XG5cbiAgYWRkRXZlbnRCaW5kIChldmVudCwgdGFyZ2V0LCBjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmFkZEJpbmRlcihuZXcgRXZlbnRCaW5kKGV2ZW50LCB0YXJnZXQsIGNhbGxiYWNrKSlcbiAgfVxuXG4gIGFkZEJpbmRlciAoYmluZGVyKSB7XG4gICAgaWYgKGJpbmRlci5jYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBiaW5kZXIuY2FsbGJhY2sgPSB0aGlzLmludmFsaWRhdGVDYWxsYmFja1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLnNvbWUoZnVuY3Rpb24gKGV2ZW50QmluZCkge1xuICAgICAgcmV0dXJuIGV2ZW50QmluZC5lcXVhbHMoYmluZGVyKVxuICAgIH0pKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRpb25FdmVudHMucHVzaChwbHVjayh0aGlzLnJlY3ljbGVkLCBmdW5jdGlvbiAoZXZlbnRCaW5kKSB7XG4gICAgICAgIHJldHVybiBldmVudEJpbmQuZXF1YWxzKGJpbmRlcilcbiAgICAgIH0pIHx8IGJpbmRlcilcbiAgICB9XG4gIH1cblxuICBnZXRVbmtub3duQ2FsbGJhY2sgKHByb3ApIHtcbiAgICB2YXIgY2FsbGJhY2tcbiAgICBjYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmFkZFVua25vd24oZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gcHJvcC5nZXQoKVxuICAgICAgfSwgcHJvcClcbiAgICB9XG4gICAgY2FsbGJhY2sucHJvcCA9IHByb3BcbiAgICByZXR1cm4gY2FsbGJhY2tcbiAgfVxuXG4gIGFkZFVua25vd24gKGZuLCBwcm9wKSB7XG4gICAgaWYgKCF0aGlzLmZpbmRVbmtub3duKHByb3ApKSB7XG4gICAgICBmbi5wcm9wID0gcHJvcFxuICAgICAgdGhpcy51bmtub3ducy5wdXNoKGZuKVxuICAgICAgcmV0dXJuIHRoaXMudW5rbm93bigpXG4gICAgfVxuICB9XG5cbiAgZmluZFVua25vd24gKHByb3ApIHtcbiAgICBpZiAocHJvcCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy51bmtub3ducy5maW5kKGZ1bmN0aW9uICh1bmtub3duKSB7XG4gICAgICAgIHJldHVybiB1bmtub3duLnByb3AgPT09IHByb3BcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgZXZlbnQgKGV2ZW50LCB0YXJnZXQgPSB0aGlzLnNjb3BlKSB7XG4gICAgaWYgKHRoaXMuY2hlY2tFbWl0dGVyKHRhcmdldCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmFkZEV2ZW50QmluZChldmVudCwgdGFyZ2V0KVxuICAgIH1cbiAgfVxuXG4gIHZhbHVlICh2YWwsIGV2ZW50LCB0YXJnZXQgPSB0aGlzLnNjb3BlKSB7XG4gICAgdGhpcy5ldmVudChldmVudCwgdGFyZ2V0KVxuICAgIHJldHVybiB2YWxcbiAgfVxuXG4gIC8qKlxuICAgKiBAdGVtcGxhdGUgVFxuICAgKiBAcGFyYW0ge1Byb3BlcnR5PFQ+fSBwcm9wXG4gICAqIEByZXR1cm4ge1R9XG4gICAqL1xuICBwcm9wIChwcm9wKSB7XG4gICAgaWYgKHByb3AgIT0gbnVsbCkge1xuICAgICAgdGhpcy5hZGRFdmVudEJpbmQoJ2ludmFsaWRhdGVkJywgcHJvcC5ldmVudHMsIHRoaXMuZ2V0VW5rbm93bkNhbGxiYWNrKHByb3ApKVxuICAgICAgcmV0dXJuIHRoaXMudmFsdWUocHJvcC5nZXQoKSwgJ3VwZGF0ZWQnLCBwcm9wLmV2ZW50cylcbiAgICB9XG4gIH1cblxuICBwcm9wQnlOYW1lIChwcm9wLCB0YXJnZXQgPSB0aGlzLnNjb3BlKSB7XG4gICAgaWYgKHRhcmdldC5wcm9wZXJ0aWVzTWFuYWdlciAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wKHRhcmdldC5wcm9wZXJ0aWVzTWFuYWdlci5nZXRQcm9wZXJ0eShwcm9wKSlcbiAgICB9IGVsc2UgaWYgKHRhcmdldFtwcm9wICsgJ1Byb3BlcnR5J10gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcCh0YXJnZXRbcHJvcCArICdQcm9wZXJ0eSddKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdXG4gICAgfVxuICB9XG5cbiAgcHJvcFBhdGggKHBhdGgsIHRhcmdldCA9IHRoaXMuc2NvcGUpIHtcbiAgICB2YXIgcHJvcCwgdmFsXG4gICAgcGF0aCA9IHBhdGguc3BsaXQoJy4nKVxuICAgIHZhbCA9IHRhcmdldFxuICAgIHdoaWxlICgodmFsICE9IG51bGwpICYmIHBhdGgubGVuZ3RoID4gMCkge1xuICAgICAgcHJvcCA9IHBhdGguc2hpZnQoKVxuICAgICAgdmFsID0gdGhpcy5wcm9wQnlOYW1lKHByb3AsIHZhbClcbiAgICB9XG4gICAgcmV0dXJuIHZhbFxuICB9XG5cbiAgZnVuY3QgKGZ1bmN0KSB7XG4gICAgdmFyIGludmFsaWRhdG9yLCByZXNcbiAgICBpbnZhbGlkYXRvciA9IG5ldyBJbnZhbGlkYXRvcigoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5hZGRVbmtub3duKCgpID0+IHtcbiAgICAgICAgdmFyIHJlczJcbiAgICAgICAgcmVzMiA9IGZ1bmN0KGludmFsaWRhdG9yKVxuICAgICAgICBpZiAocmVzICE9PSByZXMyKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpXG4gICAgICAgIH1cbiAgICAgIH0sIGludmFsaWRhdG9yKVxuICAgIH0pXG4gICAgcmVzID0gZnVuY3QoaW52YWxpZGF0b3IpXG4gICAgdGhpcy5pbnZhbGlkYXRpb25FdmVudHMucHVzaChpbnZhbGlkYXRvcilcbiAgICByZXR1cm4gcmVzXG4gIH1cblxuICB2YWxpZGF0ZVVua25vd25zICgpIHtcbiAgICB2YXIgdW5rbm93bnNcbiAgICB1bmtub3ducyA9IHRoaXMudW5rbm93bnNcbiAgICB0aGlzLnVua25vd25zID0gW11cbiAgICByZXR1cm4gdW5rbm93bnMuZm9yRWFjaChmdW5jdGlvbiAodW5rbm93bikge1xuICAgICAgcmV0dXJuIHVua25vd24oKVxuICAgIH0pXG4gIH1cblxuICBpc0VtcHR5ICgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRpb25FdmVudHMubGVuZ3RoID09PSAwXG4gIH1cblxuICBiaW5kICgpIHtcbiAgICB0aGlzLmludmFsaWQgPSBmYWxzZVxuICAgIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50QmluZCkge1xuICAgICAgZXZlbnRCaW5kLmJpbmQoKVxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHJlY3ljbGUgKGZuKSB7XG4gICAgdmFyIGRvbmUsIHJlc1xuICAgIHRoaXMucmVjeWNsZWQgPSB0aGlzLmludmFsaWRhdGlvbkV2ZW50c1xuICAgIHRoaXMuaW52YWxpZGF0aW9uRXZlbnRzID0gW11cbiAgICBkb25lID0gdGhpcy5lbmRSZWN5Y2xlLmJpbmQodGhpcylcbiAgICBpZiAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAoZm4ubGVuZ3RoID4gMSkge1xuICAgICAgICByZXR1cm4gZm4odGhpcywgZG9uZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcyA9IGZuKHRoaXMpXG4gICAgICAgIGRvbmUoKVxuICAgICAgICByZXR1cm4gcmVzXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBkb25lXG4gICAgfVxuICB9XG5cbiAgZW5kUmVjeWNsZSAoKSB7XG4gICAgdGhpcy5yZWN5Y2xlZC5mb3JFYWNoKGZ1bmN0aW9uIChldmVudEJpbmQpIHtcbiAgICAgIHJldHVybiBldmVudEJpbmQudW5iaW5kKClcbiAgICB9KVxuICAgIHRoaXMucmVjeWNsZWQgPSBbXVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBjaGVja0VtaXR0ZXIgKGVtaXR0ZXIpIHtcbiAgICByZXR1cm4gRXZlbnRCaW5kLmNoZWNrRW1pdHRlcihlbWl0dGVyLCB0aGlzLnN0cmljdClcbiAgfVxuXG4gIGNoZWNrUHJvcEluc3RhbmNlIChwcm9wKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBwcm9wLmdldCA9PT0gJ2Z1bmN0aW9uJyAmJiB0aGlzLmNoZWNrRW1pdHRlcihwcm9wLmV2ZW50cylcbiAgfVxuXG4gIHVuYmluZCAoKSB7XG4gICAgdGhpcy5pbnZhbGlkYXRpb25FdmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnRCaW5kKSB7XG4gICAgICBldmVudEJpbmQudW5iaW5kKClcbiAgICB9KVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn07XG5cbkludmFsaWRhdG9yLnN0cmljdCA9IHRydWVcblxubW9kdWxlLmV4cG9ydHMgPSBJbnZhbGlkYXRvclxuIiwiY29uc3QgUHJvcGVydHkgPSByZXF1aXJlKCcuL1Byb3BlcnR5JylcblxuY2xhc3MgUHJvcGVydGllc01hbmFnZXIge1xuICBjb25zdHJ1Y3RvciAocHJvcGVydGllcyA9IHt9LCBvcHRpb25zID0ge30pIHtcbiAgICAvKipcbiAgICAgKiBAdHlwZSB7QXJyYXkuPFByb3BlcnR5Pn1cbiAgICAgKi9cbiAgICB0aGlzLnByb3BlcnRpZXMgPSBbXVxuICAgIHRoaXMuZ2xvYmFsT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIG9wdGlvbnMpXG4gICAgdGhpcy5wcm9wZXJ0aWVzT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHByb3BlcnRpZXMpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHsqfSBwcm9wZXJ0aWVzXG4gICAqIEBwYXJhbSB7Kn0gb3B0aW9uc1xuICAgKiBAcmV0dXJuIHtQcm9wZXJ0aWVzTWFuYWdlcn1cbiAgICovXG4gIGNvcHlXaXRoIChwcm9wZXJ0aWVzID0ge30sIG9wdGlvbnMgPSB7fSkge1xuICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzLm1lcmdlUHJvcGVydGllc09wdGlvbnModGhpcy5wcm9wZXJ0aWVzT3B0aW9ucywgcHJvcGVydGllcyksIE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2xvYmFsT3B0aW9ucywgb3B0aW9ucykpXG4gIH1cblxuICB3aXRoUHJvcGVydHkgKHByb3AsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0ge31cbiAgICBwcm9wZXJ0aWVzW3Byb3BdID0gb3B0aW9uc1xuICAgIHJldHVybiB0aGlzLmNvcHlXaXRoKHByb3BlcnRpZXMpXG4gIH1cblxuICB1c2VTY29wZSAoc2NvcGUpIHtcbiAgICByZXR1cm4gdGhpcy5jb3B5V2l0aCh7fSwgeyBzY29wZTogc2NvcGUgfSlcbiAgfVxuXG4gIG1lcmdlUHJvcGVydGllc09wdGlvbnMgKC4uLmFyZykge1xuICAgIHJldHVybiBhcmcucmVkdWNlKChyZXMsIG9wdCkgPT4ge1xuICAgICAgT2JqZWN0LmtleXMob3B0KS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAgIHJlc1tuYW1lXSA9IHRoaXMubWVyZ2VQcm9wZXJ0eU9wdGlvbnMocmVzW25hbWVdIHx8IHt9LCBvcHRbbmFtZV0pXG4gICAgICB9KVxuICAgICAgcmV0dXJuIHJlc1xuICAgIH0sIHt9KVxuICB9XG5cbiAgbWVyZ2VQcm9wZXJ0eU9wdGlvbnMgKC4uLmFyZykge1xuICAgIGNvbnN0IG5vdE1lcmdhYmxlID0gWydkZWZhdWx0JywgJ3Njb3BlJ11cbiAgICByZXR1cm4gYXJnLnJlZHVjZSgocmVzLCBvcHQpID0+IHtcbiAgICAgIE9iamVjdC5rZXlzKG9wdCkuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIHJlc1tuYW1lXSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2Ygb3B0W25hbWVdID09PSAnZnVuY3Rpb24nICYmICFub3RNZXJnYWJsZS5pbmNsdWRlcyhuYW1lKSkge1xuICAgICAgICAgIHJlc1tuYW1lXSA9IHRoaXMubWVyZ2VDYWxsYmFjayhyZXNbbmFtZV0sIG9wdFtuYW1lXSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNbbmFtZV0gPSBvcHRbbmFtZV1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHJldHVybiByZXNcbiAgICB9LCB7fSlcbiAgfVxuXG4gIG1lcmdlQ2FsbGJhY2sgKG9sZEZ1bmN0LCBuZXdGdW5jdCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJnKSB7XG4gICAgICByZXR1cm4gbmV3RnVuY3QuY2FsbCh0aGlzLCAuLi5hcmcsIG9sZEZ1bmN0LmJpbmQodGhpcykpXG4gICAgfVxuICB9XG5cbiAgaW5pdFByb3BlcnRpZXMgKCkge1xuICAgIHRoaXMuYWRkUHJvcGVydGllcyh0aGlzLnByb3BlcnRpZXNPcHRpb25zKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBjcmVhdGVTY29wZUdldHRlclNldHRlcnMgKCkge1xuICAgIHRoaXMucHJvcGVydGllcy5mb3JFYWNoKChwcm9wKSA9PiBwcm9wLmNyZWF0ZVNjb3BlR2V0dGVyU2V0dGVycygpKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBhZGRQcm9wZXJ0eSAobmFtZSwgb3B0aW9ucykge1xuICAgIGNvbnN0IHByb3AgPSBuZXcgUHJvcGVydHkoT2JqZWN0LmFzc2lnbih7IG5hbWU6IG5hbWUgfSwgdGhpcy5nbG9iYWxPcHRpb25zLCBvcHRpb25zKSlcbiAgICB0aGlzLnByb3BlcnRpZXMucHVzaChwcm9wKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBhZGRQcm9wZXJ0aWVzIChvcHRpb25zKSB7XG4gICAgT2JqZWN0LmtleXMob3B0aW9ucykuZm9yRWFjaCgobmFtZSkgPT4gdGhpcy5hZGRQcm9wZXJ0eShuYW1lLCBvcHRpb25zW25hbWVdKSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm5zIHtQcm9wZXJ0eX1cbiAgICovXG4gIGdldFByb3BlcnR5IChuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcGVydGllcy5maW5kKChwcm9wKSA9PiBwcm9wLm9wdGlvbnMubmFtZSA9PT0gbmFtZSlcbiAgfVxuXG4gIHNldFByb3BlcnRpZXNEYXRhIChkYXRhLCBvcHRpb25zID0ge30pIHtcbiAgICBPYmplY3Qua2V5cyhkYXRhKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIGlmICgoKG9wdGlvbnMud2hpdGVsaXN0ID09IG51bGwpIHx8IG9wdGlvbnMud2hpdGVsaXN0LmluZGV4T2Yoa2V5KSAhPT0gLTEpICYmICgob3B0aW9ucy5ibGFja2xpc3QgPT0gbnVsbCkgfHwgb3B0aW9ucy5ibGFja2xpc3QuaW5kZXhPZihrZXkpID09PSAtMSkpIHtcbiAgICAgICAgY29uc3QgcHJvcCA9IHRoaXMuZ2V0UHJvcGVydHkoa2V5KVxuICAgICAgICBpZiAocHJvcCkge1xuICAgICAgICAgIHByb3Auc2V0KGRhdGFba2V5XSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGdldE1hbnVhbERhdGFQcm9wZXJ0aWVzICgpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzLnJlZHVjZSgocmVzLCBwcm9wKSA9PiB7XG4gICAgICBpZiAocHJvcC5nZXR0ZXIuY2FsY3VsYXRlZCAmJiBwcm9wLm1hbnVhbCkge1xuICAgICAgICByZXNbcHJvcC5vcHRpb25zLm5hbWVdID0gcHJvcC5nZXQoKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc1xuICAgIH0sIHt9KVxuICB9XG5cbiAgZGVzdHJveSAoKSB7XG4gICAgdGhpcy5wcm9wZXJ0aWVzLmZvckVhY2goKHByb3ApID0+IHByb3AuZGVzdHJveSgpKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvcGVydGllc01hbmFnZXJcbiIsImNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlclxuXG5jb25zdCBTaW1wbGVHZXR0ZXIgPSByZXF1aXJlKCcuL2dldHRlcnMvU2ltcGxlR2V0dGVyJylcbmNvbnN0IENhbGN1bGF0ZWRHZXR0ZXIgPSByZXF1aXJlKCcuL2dldHRlcnMvQ2FsY3VsYXRlZEdldHRlcicpXG5jb25zdCBJbnZhbGlkYXRlZEdldHRlciA9IHJlcXVpcmUoJy4vZ2V0dGVycy9JbnZhbGlkYXRlZEdldHRlcicpXG5jb25zdCBNYW51YWxHZXR0ZXIgPSByZXF1aXJlKCcuL2dldHRlcnMvTWFudWFsR2V0dGVyJylcbmNvbnN0IENvbXBvc2l0ZUdldHRlciA9IHJlcXVpcmUoJy4vZ2V0dGVycy9Db21wb3NpdGVHZXR0ZXInKVxuXG5jb25zdCBNYW51YWxTZXR0ZXIgPSByZXF1aXJlKCcuL3NldHRlcnMvTWFudWFsU2V0dGVyJylcbmNvbnN0IFNpbXBsZVNldHRlciA9IHJlcXVpcmUoJy4vc2V0dGVycy9TaW1wbGVTZXR0ZXInKVxuY29uc3QgQmFzZVZhbHVlU2V0dGVyID0gcmVxdWlyZSgnLi9zZXR0ZXJzL0Jhc2VWYWx1ZVNldHRlcicpXG5jb25zdCBDb2xsZWN0aW9uU2V0dGVyID0gcmVxdWlyZSgnLi9zZXR0ZXJzL0NvbGxlY3Rpb25TZXR0ZXInKVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKi9cbmNsYXNzIFByb3BlcnR5IHtcbiAgLyoqXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IFByb3BlcnR5T3B0aW9uc1xuICAgKiBAcHJvcGVydHkge1R9IFtkZWZhdWx0XVxuICAgKiBAcHJvcGVydHkge2Z1bmN0aW9uKGltcG9ydChcIi4vSW52YWxpZGF0b3JcIikpOiBUfSBbY2FsY3VsXVxuICAgKiBAcHJvcGVydHkge2Z1bmN0aW9uKCk6IFR9IFtnZXRdXG4gICAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb24oVCl9IFtzZXRdXG4gICAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb24oVCxUKXxpbXBvcnQoXCIuL1Byb3BlcnR5V2F0Y2hlclwiKTxUPn0gW2NoYW5nZV1cbiAgICogQHByb3BlcnR5IHtib29sZWFufHN0cmluZ3xmdW5jdGlvbihULFQpOlR9IFtjb21wb3NlZF1cbiAgICogQHByb3BlcnR5IHtib29sZWFufE9iamVjdH0gW2NvbGxlY3Rpb25dXG4gICAqIEBwcm9wZXJ0eSB7Kn0gW3Njb3BlXVxuICAgKlxuICAgKiBAcGFyYW0ge1Byb3BlcnR5T3B0aW9uc30gb3B0aW9uc1xuICAgKi9cbiAgY29uc3RydWN0b3IgKG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIFByb3BlcnR5LmRlZmF1bHRPcHRpb25zLCBvcHRpb25zKVxuICAgIHRoaXMuaW5pdCgpXG4gIH1cblxuICBpbml0ICgpIHtcbiAgICAvKipcbiAgICAgKiBAdHlwZSB7RXZlbnRFbWl0dGVyfVxuICAgICAqL1xuICAgIHRoaXMuZXZlbnRzID0gbmV3IHRoaXMub3B0aW9ucy5FdmVudEVtaXR0ZXJDbGFzcygpXG4gICAgdGhpcy5tYWtlU2V0dGVyKClcbiAgICB0aGlzLm1ha2VHZXR0ZXIoKVxuICAgIHRoaXMuc2V0dGVyLmluaXQoKVxuICAgIHRoaXMuZ2V0dGVyLmluaXQoKVxuICAgIHRoaXMuc2V0dGVyLmxvYWRJbnRlcm5hbFdhdGNoZXIoKVxuICB9XG5cbiAgbWFrZUdldHRlciAoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMuZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLmdldHRlciA9IG5ldyBNYW51YWxHZXR0ZXIodGhpcylcbiAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5jb21wb3NlZCAhPSBudWxsICYmIHRoaXMub3B0aW9ucy5jb21wb3NlZCAhPT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuZ2V0dGVyID0gbmV3IENvbXBvc2l0ZUdldHRlcih0aGlzKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5jYWxjdWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuY2FsY3VsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLmdldHRlciA9IG5ldyBDYWxjdWxhdGVkR2V0dGVyKHRoaXMpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmdldHRlciA9IG5ldyBJbnZhbGlkYXRlZEdldHRlcih0aGlzKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmdldHRlciA9IG5ldyBTaW1wbGVHZXR0ZXIodGhpcylcbiAgICB9XG4gIH1cblxuICBtYWtlU2V0dGVyICgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5zZXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuc2V0dGVyID0gbmV3IE1hbnVhbFNldHRlcih0aGlzKVxuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmNvbGxlY3Rpb24gIT0gbnVsbCAmJiB0aGlzLm9wdGlvbnMuY29sbGVjdGlvbiAhPT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuc2V0dGVyID0gbmV3IENvbGxlY3Rpb25TZXR0ZXIodGhpcylcbiAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5jb21wb3NlZCAhPSBudWxsICYmIHRoaXMub3B0aW9ucy5jb21wb3NlZCAhPT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuc2V0dGVyID0gbmV3IEJhc2VWYWx1ZVNldHRlcih0aGlzKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldHRlciA9IG5ldyBTaW1wbGVTZXR0ZXIodGhpcylcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHsqfSBvcHRpb25zXG4gICAqIEByZXR1cm5zIHtQcm9wZXJ0eTxUPn1cbiAgICovXG4gIGNvcHlXaXRoIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKE9iamVjdC5hc3NpZ24oe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucykpXG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge1R9XG4gICAqL1xuICBnZXQgKCkge1xuICAgIHJldHVybiB0aGlzLmdldHRlci5nZXQoKVxuICB9XG5cbiAgaW52YWxpZGF0ZSAoKSB7XG4gICAgdGhpcy5nZXR0ZXIuaW52YWxpZGF0ZSgpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHVua25vd24gKCkge1xuICAgIHRoaXMuZ2V0dGVyLnVua25vd24oKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzZXQgKHZhbCkge1xuICAgIHJldHVybiB0aGlzLnNldHRlci5zZXQodmFsKVxuICB9XG5cbiAgY3JlYXRlU2NvcGVHZXR0ZXJTZXR0ZXJzICgpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLnNjb3BlKSB7XG4gICAgICBjb25zdCBwcm9wID0gdGhpc1xuICAgICAgbGV0IG9wdCA9IHt9XG4gICAgICBvcHRbdGhpcy5vcHRpb25zLm5hbWUgKyAnUHJvcGVydHknXSA9IHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHByb3BcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgb3B0ID0gdGhpcy5nZXR0ZXIuZ2V0U2NvcGVHZXR0ZXJTZXR0ZXJzKG9wdClcbiAgICAgIG9wdCA9IHRoaXMuc2V0dGVyLmdldFNjb3BlR2V0dGVyU2V0dGVycyhvcHQpXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLm9wdGlvbnMuc2NvcGUsIG9wdClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZGVzdHJveSA9PT0gdHJ1ZSAmJiB0aGlzLnZhbHVlICE9IG51bGwgJiYgdGhpcy52YWx1ZS5kZXN0cm95ICE9IG51bGwpIHtcbiAgICAgIHRoaXMudmFsdWUuZGVzdHJveSgpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLmRlc3Ryb3kgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuY2FsbE9wdGlvbkZ1bmN0KCdkZXN0cm95JywgdGhpcy52YWx1ZSlcbiAgICB9XG4gICAgdGhpcy5nZXR0ZXIuZGVzdHJveSgpXG4gICAgdGhpcy52YWx1ZSA9IG51bGxcbiAgfVxuXG4gIGNhbGxPcHRpb25GdW5jdCAoZnVuY3QsIC4uLmFyZ3MpIHtcbiAgICBpZiAodHlwZW9mIGZ1bmN0ID09PSAnc3RyaW5nJykge1xuICAgICAgZnVuY3QgPSB0aGlzLm9wdGlvbnNbZnVuY3RdXG4gICAgfVxuICAgIHJldHVybiBmdW5jdC5hcHBseSh0aGlzLm9wdGlvbnMuc2NvcGUgfHwgdGhpcywgYXJncylcbiAgfVxufVxuXG5Qcm9wZXJ0eS5kZWZhdWx0T3B0aW9ucyA9IHtcbiAgRXZlbnRFbWl0dGVyQ2xhc3M6IEV2ZW50RW1pdHRlclxufVxubW9kdWxlLmV4cG9ydHMgPSBQcm9wZXJ0eVxuIiwiXG5jbGFzcyBCYXNlR2V0dGVyIHtcbiAgY29uc3RydWN0b3IgKHByb3ApIHtcbiAgICB0aGlzLnByb3AgPSBwcm9wXG4gIH1cblxuICBpbml0ICgpIHtcbiAgICB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZVxuICAgIHRoaXMuaW5pdGlhdGVkID0gZmFsc2VcbiAgfVxuXG4gIGdldCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKVxuICB9XG5cbiAgb3V0cHV0ICgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMucHJvcC5vcHRpb25zLm91dHB1dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcC5jYWxsT3B0aW9uRnVuY3QoJ291dHB1dCcsIHRoaXMucHJvcC52YWx1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcC52YWx1ZVxuICAgIH1cbiAgfVxuXG4gIHJldmFsaWRhdGVkICgpIHtcbiAgICB0aGlzLmNhbGN1bGF0ZWQgPSB0cnVlXG4gICAgdGhpcy5pbml0aWF0ZWQgPSB0cnVlXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHVua25vd24gKCkge1xuICAgIGlmICh0aGlzLmNhbGN1bGF0ZWQpIHtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZU5vdGljZSgpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBpbnZhbGlkYXRlICgpIHtcbiAgICBpZiAodGhpcy5jYWxjdWxhdGVkKSB7XG4gICAgICB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZVxuICAgICAgdGhpcy5pbnZhbGlkYXRlTm90aWNlKClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGludmFsaWRhdGVOb3RpY2UgKCkge1xuICAgIHRoaXMucHJvcC5ldmVudHMuZW1pdCgnaW52YWxpZGF0ZWQnKVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7UHJvcGVydHlEZXNjcmlwdG9yTWFwfSBvcHRcbiAgICogQHJldHVybiB7UHJvcGVydHlEZXNjcmlwdG9yTWFwfVxuICAgKi9cbiAgZ2V0U2NvcGVHZXR0ZXJTZXR0ZXJzIChvcHQpIHtcbiAgICBjb25zdCBwcm9wID0gdGhpcy5wcm9wXG4gICAgb3B0W3RoaXMucHJvcC5vcHRpb25zLm5hbWVdID0gb3B0W3RoaXMucHJvcC5vcHRpb25zLm5hbWVdIHx8IHt9XG4gICAgb3B0W3RoaXMucHJvcC5vcHRpb25zLm5hbWVdLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBwcm9wLmdldCgpXG4gICAgfVxuICAgIG9wdFt0aGlzLnByb3Aub3B0aW9ucy5uYW1lXS5lbnVtZXJhYmxlID0gdHJ1ZVxuICAgIG9wdFt0aGlzLnByb3Aub3B0aW9ucy5uYW1lXS5jb25maWd1cmFibGUgPSB0cnVlXG4gICAgcmV0dXJuIG9wdFxuICB9XG5cbiAgZGVzdHJveSAoKSB7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlR2V0dGVyXG4iLCJcbmNvbnN0IEJhc2VHZXR0ZXIgPSByZXF1aXJlKCcuL0Jhc2VHZXR0ZXInKVxuXG5jbGFzcyBDYWxjdWxhdGVkR2V0dGVyIGV4dGVuZHMgQmFzZUdldHRlciB7XG4gIGdldCAoKSB7XG4gICAgaWYgKCF0aGlzLmNhbGN1bGF0ZWQpIHtcbiAgICAgIGNvbnN0IG9sZCA9IHRoaXMucHJvcC52YWx1ZVxuICAgICAgY29uc3QgaW5pdGlhdGVkID0gdGhpcy5pbml0aWF0ZWRcbiAgICAgIHRoaXMuY2FsY3VsKClcbiAgICAgIGlmICghaW5pdGlhdGVkKSB7XG4gICAgICAgIHRoaXMucHJvcC5ldmVudHMuZW1pdCgndXBkYXRlZCcsIG9sZClcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wLnNldHRlci5jaGVja0NoYW5nZXModGhpcy5wcm9wLnZhbHVlLCBvbGQpKSB7XG4gICAgICAgIHRoaXMucHJvcC5zZXR0ZXIuY2hhbmdlZChvbGQpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm91dHB1dCgpXG4gIH1cblxuICBjYWxjdWwgKCkge1xuICAgIHRoaXMucHJvcC5zZXR0ZXIuc2V0UmF3VmFsdWUodGhpcy5wcm9wLmNhbGxPcHRpb25GdW5jdCgnY2FsY3VsJykpXG4gICAgdGhpcy5wcm9wLm1hbnVhbCA9IGZhbHNlXG4gICAgdGhpcy5yZXZhbGlkYXRlZCgpXG4gICAgcmV0dXJuIHRoaXMucHJvcC52YWx1ZVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FsY3VsYXRlZEdldHRlclxuIiwiY29uc3QgSW52YWxpZGF0ZWRHZXR0ZXIgPSByZXF1aXJlKCcuL0ludmFsaWRhdGVkR2V0dGVyJylcbmNvbnN0IENvbGxlY3Rpb24gPSByZXF1aXJlKCdzcGFyay1jb2xsZWN0aW9uJylcbmNvbnN0IEludmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vSW52YWxpZGF0b3InKVxuY29uc3QgUmVmZXJlbmNlID0gcmVxdWlyZSgnc3BhcmstYmluZGluZycpLlJlZmVyZW5jZVxuXG5jbGFzcyBDb21wb3NpdGVHZXR0ZXIgZXh0ZW5kcyBJbnZhbGlkYXRlZEdldHRlciB7XG4gIGluaXQgKCkge1xuICAgIHN1cGVyLmluaXQoKVxuICAgIGlmICh0aGlzLnByb3Aub3B0aW9ucy5kZWZhdWx0ICE9IG51bGwpIHtcbiAgICAgIHRoaXMuYmFzZVZhbHVlID0gdGhpcy5wcm9wLm9wdGlvbnMuZGVmYXVsdFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByb3Auc2V0dGVyLnNldFJhd1ZhbHVlKG51bGwpXG4gICAgICB0aGlzLmJhc2VWYWx1ZSA9IG51bGxcbiAgICB9XG4gICAgdGhpcy5tZW1iZXJzID0gbmV3IENvbXBvc2l0ZUdldHRlci5NZW1iZXJzKHRoaXMucHJvcC5vcHRpb25zLm1lbWJlcnMpXG4gICAgaWYgKHRoaXMucHJvcC5vcHRpb25zLmNhbGN1bCAhPSBudWxsKSB7XG4gICAgICB0aGlzLm1lbWJlcnMudW5zaGlmdCgocHJldiwgaW52YWxpZGF0b3IpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcC5vcHRpb25zLmNhbGN1bC5iaW5kKHRoaXMucHJvcC5vcHRpb25zLnNjb3BlKShpbnZhbGlkYXRvcilcbiAgICAgIH0pXG4gICAgfVxuICAgIHRoaXMubWVtYmVycy5jaGFuZ2VkID0gKG9sZCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuaW52YWxpZGF0ZSgpXG4gICAgfVxuICAgIHRoaXMucHJvcC5tZW1iZXJzID0gdGhpcy5tZW1iZXJzXG5cbiAgICBpZiAodHlwZW9mIHRoaXMucHJvcC5vcHRpb25zLmNvbXBvc2VkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLmpvaW4gPSB0aGlzLnByb3Aub3B0aW9ucy5jb21wb3NlZFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMucHJvcC5vcHRpb25zLmNvbXBvc2VkID09PSAnc3RyaW5nJyAmJiBDb21wb3NpdGVHZXR0ZXIuam9pbkZ1bmN0aW9uc1t0aGlzLnByb3Aub3B0aW9ucy5jb21wb3NlZF0gIT0gbnVsbCkge1xuICAgICAgdGhpcy5qb2luID0gQ29tcG9zaXRlR2V0dGVyLmpvaW5GdW5jdGlvbnNbdGhpcy5wcm9wLm9wdGlvbnMuY29tcG9zZWRdXG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3Aub3B0aW9ucy5kZWZhdWx0ID09PSBmYWxzZSkge1xuICAgICAgdGhpcy5qb2luID0gQ29tcG9zaXRlR2V0dGVyLmpvaW5GdW5jdGlvbnMub3JcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcC5vcHRpb25zLmRlZmF1bHQgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuam9pbiA9IENvbXBvc2l0ZUdldHRlci5qb2luRnVuY3Rpb25zLmFuZFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmpvaW4gPSBDb21wb3NpdGVHZXR0ZXIuam9pbkZ1bmN0aW9ucy5sYXN0XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsICgpIHtcbiAgICBpZiAodGhpcy5tZW1iZXJzLmxlbmd0aCkge1xuICAgICAgaWYgKCF0aGlzLmludmFsaWRhdG9yKSB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IgPSBuZXcgSW52YWxpZGF0b3IodGhpcy5wcm9wLCB0aGlzLnByb3Aub3B0aW9ucy5zY29wZSlcbiAgICAgIH1cbiAgICAgIHRoaXMuaW52YWxpZGF0b3IucmVjeWNsZSgoaW52YWxpZGF0b3IsIGRvbmUpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wLnNldHRlci5zZXRSYXdWYWx1ZSh0aGlzLm1lbWJlcnMucmVkdWNlKChwcmV2LCBtZW1iZXIpID0+IHtcbiAgICAgICAgICB2YXIgdmFsXG4gICAgICAgICAgdmFsID0gdHlwZW9mIG1lbWJlciA9PT0gJ2Z1bmN0aW9uJyA/IG1lbWJlcihwcmV2LCB0aGlzLmludmFsaWRhdG9yKSA6IG1lbWJlclxuICAgICAgICAgIHJldHVybiB0aGlzLmpvaW4ocHJldiwgdmFsKVxuICAgICAgICB9LCB0aGlzLmJhc2VWYWx1ZSkpXG4gICAgICAgIGRvbmUoKVxuICAgICAgICBpZiAoaW52YWxpZGF0b3IuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgdGhpcy5pbnZhbGlkYXRvciA9IG51bGxcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbnZhbGlkYXRvci5iaW5kKClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcm9wLnNldHRlci5zZXRSYXdWYWx1ZSh0aGlzLmJhc2VWYWx1ZSlcbiAgICB9XG4gICAgdGhpcy5yZXZhbGlkYXRlZCgpXG4gICAgcmV0dXJuIHRoaXMucHJvcC52YWx1ZVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7UHJvcGVydHlEZXNjcmlwdG9yTWFwfSBvcHRcbiAgICogQHJldHVybiB7UHJvcGVydHlEZXNjcmlwdG9yTWFwfVxuICAgKi9cbiAgZ2V0U2NvcGVHZXR0ZXJTZXR0ZXJzIChvcHQpIHtcbiAgICBvcHQgPSBzdXBlci5nZXRTY29wZUdldHRlclNldHRlcnMob3B0KVxuICAgIGNvbnN0IG1lbWJlcnMgPSB0aGlzLm1lbWJlcnNcbiAgICBvcHRbdGhpcy5wcm9wLm9wdGlvbnMubmFtZSArICdNZW1iZXJzJ10gPSB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG1lbWJlcnNcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9wdFxuICB9XG59XG5cbkNvbXBvc2l0ZUdldHRlci5qb2luRnVuY3Rpb25zID0ge1xuICBhbmQ6IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGEgJiYgYlxuICB9LFxuICBvcjogZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYSB8fCBiXG4gIH0sXG4gIGxhc3Q6IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGJcbiAgfSxcbiAgc3VtOiBmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBhICsgYlxuICB9XG59XG5cbkNvbXBvc2l0ZUdldHRlci5NZW1iZXJzID0gY2xhc3MgTWVtYmVycyBleHRlbmRzIENvbGxlY3Rpb24ge1xuICBhZGRQcm9wZXJ0eSAocHJvcCkge1xuICAgIGlmICh0aGlzLmZpbmRSZWZJbmRleChudWxsLCBwcm9wKSA9PT0gLTEpIHtcbiAgICAgIHRoaXMucHVzaChSZWZlcmVuY2UubWFrZVJlZmVycmVkKGZ1bmN0aW9uIChwcmV2LCBpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gaW52YWxpZGF0b3IucHJvcChwcm9wKVxuICAgICAgfSwge1xuICAgICAgICBwcm9wOiBwcm9wXG4gICAgICB9KSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGFkZFByb3BlcnR5UGF0aCAobmFtZSwgb2JqKSB7XG4gICAgaWYgKHRoaXMuZmluZFJlZkluZGV4KG5hbWUsIG9iaikgPT09IC0xKSB7XG4gICAgICB0aGlzLnB1c2goUmVmZXJlbmNlLm1ha2VSZWZlcnJlZChmdW5jdGlvbiAocHJldiwgaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGludmFsaWRhdG9yLnByb3BQYXRoKG5hbWUsIG9iailcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgb2JqOiBvYmpcbiAgICAgIH0pKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgcmVtb3ZlUHJvcGVydHkgKHByb3ApIHtcbiAgICB0aGlzLnJlbW92ZVJlZih7IHByb3A6IHByb3AgfSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgYWRkVmFsdWVSZWYgKHZhbCwgZGF0YSkge1xuICAgIGlmICh0aGlzLmZpbmRSZWZJbmRleChkYXRhKSA9PT0gLTEpIHtcbiAgICAgIGNvbnN0IGZuID0gUmVmZXJlbmNlLm1ha2VSZWZlcnJlZChmdW5jdGlvbiAocHJldiwgaW52YWxpZGF0b3IpIHtcbiAgICAgICAgcmV0dXJuIHZhbFxuICAgICAgfSwgZGF0YSlcbiAgICAgIGZuLnZhbCA9IHZhbFxuICAgICAgdGhpcy5wdXNoKGZuKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc2V0VmFsdWVSZWYgKHZhbCwgZGF0YSkge1xuICAgIGNvbnN0IGkgPSB0aGlzLmZpbmRSZWZJbmRleChkYXRhKVxuICAgIGlmIChpID09PSAtMSkge1xuICAgICAgdGhpcy5hZGRWYWx1ZVJlZih2YWwsIGRhdGEpXG4gICAgfSBlbHNlIGlmICh0aGlzLmdldChpKS52YWwgIT09IHZhbCkge1xuICAgICAgY29uc3QgZm4gPSBSZWZlcmVuY2UubWFrZVJlZmVycmVkKGZ1bmN0aW9uIChwcmV2LCBpbnZhbGlkYXRvcikge1xuICAgICAgICByZXR1cm4gdmFsXG4gICAgICB9LCBkYXRhKVxuICAgICAgZm4udmFsID0gdmFsXG4gICAgICB0aGlzLnNldChpLCBmbilcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGdldFZhbHVlUmVmIChkYXRhKSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEJ5UmVmKGRhdGEpLnZhbFxuICB9XG5cbiAgYWRkRnVuY3Rpb25SZWYgKGZuLCBkYXRhKSB7XG4gICAgaWYgKHRoaXMuZmluZFJlZkluZGV4KGRhdGEpID09PSAtMSkge1xuICAgICAgZm4gPSBSZWZlcmVuY2UubWFrZVJlZmVycmVkKGZuLCBkYXRhKVxuICAgICAgdGhpcy5wdXNoKGZuKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZmluZEJ5UmVmIChkYXRhKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FycmF5W3RoaXMuZmluZFJlZkluZGV4KGRhdGEpXVxuICB9XG5cbiAgZmluZFJlZkluZGV4IChkYXRhKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FycmF5LmZpbmRJbmRleChmdW5jdGlvbiAobWVtYmVyKSB7XG4gICAgICByZXR1cm4gKG1lbWJlci5yZWYgIT0gbnVsbCkgJiYgbWVtYmVyLnJlZi5jb21wYXJlRGF0YShkYXRhKVxuICAgIH0pXG4gIH1cblxuICByZW1vdmVSZWYgKGRhdGEpIHtcbiAgICB2YXIgaW5kZXgsIG9sZFxuICAgIGluZGV4ID0gdGhpcy5maW5kUmVmSW5kZXgoZGF0YSlcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICBvbGQgPSB0aGlzLnRvQXJyYXkoKVxuICAgICAgdGhpcy5fYXJyYXkuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgdGhpcy5jaGFuZ2VkKG9sZClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbXBvc2l0ZUdldHRlclxuIiwiY29uc3QgSW52YWxpZGF0b3IgPSByZXF1aXJlKCcuLi9JbnZhbGlkYXRvcicpXG5jb25zdCBDYWxjdWxhdGVkR2V0dGVyID0gcmVxdWlyZSgnLi9DYWxjdWxhdGVkR2V0dGVyJylcblxuY2xhc3MgSW52YWxpZGF0ZWRHZXR0ZXIgZXh0ZW5kcyBDYWxjdWxhdGVkR2V0dGVyIHtcbiAgZ2V0ICgpIHtcbiAgICBpZiAodGhpcy5pbnZhbGlkYXRvcikge1xuICAgICAgdGhpcy5pbnZhbGlkYXRvci52YWxpZGF0ZVVua25vd25zKClcbiAgICB9XG4gICAgcmV0dXJuIHN1cGVyLmdldCgpXG4gIH1cblxuICBjYWxjdWwgKCkge1xuICAgIGlmICghdGhpcy5pbnZhbGlkYXRvcikge1xuICAgICAgdGhpcy5pbnZhbGlkYXRvciA9IG5ldyBJbnZhbGlkYXRvcih0aGlzLnByb3AsIHRoaXMucHJvcC5vcHRpb25zLnNjb3BlKVxuICAgIH1cbiAgICB0aGlzLmludmFsaWRhdG9yLnJlY3ljbGUoKGludmFsaWRhdG9yLCBkb25lKSA9PiB7XG4gICAgICB0aGlzLnByb3Auc2V0dGVyLnNldFJhd1ZhbHVlKHRoaXMucHJvcC5jYWxsT3B0aW9uRnVuY3QoJ2NhbGN1bCcsIGludmFsaWRhdG9yKSlcbiAgICAgIHRoaXMucHJvcC5tYW51YWwgPSBmYWxzZVxuICAgICAgZG9uZSgpXG4gICAgICBpZiAoaW52YWxpZGF0b3IuaXNFbXB0eSgpKSB7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0b3IgPSBudWxsXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbnZhbGlkYXRvci5iaW5kKClcbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMucmV2YWxpZGF0ZWQoKVxuICAgIHJldHVybiB0aGlzLm91dHB1dCgpXG4gIH1cblxuICBpbnZhbGlkYXRlICgpIHtcbiAgICBpZiAodGhpcy5jYWxjdWxhdGVkKSB7XG4gICAgICB0aGlzLmNhbGN1bGF0ZWQgPSBmYWxzZVxuICAgICAgdGhpcy5pbnZhbGlkYXRlTm90aWNlKClcbiAgICAgIGlmICghdGhpcy5jYWxjdWxhdGVkICYmIHRoaXMuaW52YWxpZGF0b3IgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmludmFsaWRhdG9yLnVuYmluZCgpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICBpZiAodGhpcy5pbnZhbGlkYXRvciAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRvci51bmJpbmQoKVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludmFsaWRhdGVkR2V0dGVyXG4iLCJjb25zdCBCYXNlR2V0dGVyID0gcmVxdWlyZSgnLi9CYXNlR2V0dGVyJylcblxuY2xhc3MgTWFudWFsR2V0dGVyIGV4dGVuZHMgQmFzZUdldHRlciB7XG4gIGdldCAoKSB7XG4gICAgdGhpcy5wcm9wLnNldHRlci5zZXRSYXdWYWx1ZSh0aGlzLnByb3AuY2FsbE9wdGlvbkZ1bmN0KCdnZXQnKSlcbiAgICB0aGlzLmNhbGN1bGF0ZWQgPSB0cnVlXG4gICAgdGhpcy5pbml0aWF0ZWQgPSB0cnVlXG4gICAgcmV0dXJuIHRoaXMub3V0cHV0KClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hbnVhbEdldHRlclxuIiwiY29uc3QgQmFzZUdldHRlciA9IHJlcXVpcmUoJy4vQmFzZUdldHRlcicpXG5cbmNsYXNzIFNpbXBsZUdldHRlciBleHRlbmRzIEJhc2VHZXR0ZXIge1xuICBnZXQgKCkge1xuICAgIHRoaXMuY2FsY3VsYXRlZCA9IHRydWVcbiAgICBpZiAoIXRoaXMuaW5pdGlhdGVkKSB7XG4gICAgICB0aGlzLmluaXRpYXRlZCA9IHRydWVcbiAgICAgIHRoaXMucHJvcC5ldmVudHMuZW1pdCgndXBkYXRlZCcpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLm91dHB1dCgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVHZXR0ZXJcbiIsIlxuY29uc3QgUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnLi4vd2F0Y2hlcnMvUHJvcGVydHlXYXRjaGVyJylcblxuY2xhc3MgQmFzZVNldHRlciB7XG4gIGNvbnN0cnVjdG9yIChwcm9wKSB7XG4gICAgdGhpcy5wcm9wID0gcHJvcFxuICB9XG5cbiAgaW5pdCAoKSB7XG4gICAgdGhpcy5zZXREZWZhdWx0VmFsdWUoKVxuICB9XG5cbiAgc2V0RGVmYXVsdFZhbHVlICgpIHtcbiAgICB0aGlzLnNldFJhd1ZhbHVlKHRoaXMuaW5nZXN0KHRoaXMucHJvcC5vcHRpb25zLmRlZmF1bHQpKVxuICB9XG5cbiAgbG9hZEludGVybmFsV2F0Y2hlciAoKSB7XG4gICAgY29uc3QgY2hhbmdlT3B0ID0gdGhpcy5wcm9wLm9wdGlvbnMuY2hhbmdlXG4gICAgaWYgKHR5cGVvZiBjaGFuZ2VPcHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvcGVydHlXYXRjaGVyKHtcbiAgICAgICAgcHJvcGVydHk6IHRoaXMucHJvcCxcbiAgICAgICAgY2FsbGJhY2s6IGNoYW5nZU9wdCxcbiAgICAgICAgc2NvcGU6IHRoaXMucHJvcC5vcHRpb25zLnNjb3BlLFxuICAgICAgICBhdXRvQmluZDogdHJ1ZVxuICAgICAgfSlcbiAgICB9IGVsc2UgaWYgKGNoYW5nZU9wdCAhPSBudWxsICYmIHR5cGVvZiBjaGFuZ2VPcHQuY29weVdpdGggPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBjaGFuZ2VPcHQuY29weVdpdGgoe1xuICAgICAgICBwcm9wZXJ0eTogdGhpcy5wcm9wLFxuICAgICAgICBhdXRvQmluZDogdHJ1ZVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBzZXQgKHZhbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJylcbiAgfVxuXG4gIHNldFJhd1ZhbHVlICh2YWwpIHtcbiAgICB0aGlzLnByb3AudmFsdWUgPSB2YWxcbiAgICByZXR1cm4gdGhpcy5wcm9wLnZhbHVlXG4gIH1cblxuICBpbmdlc3QgKHZhbCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wLm9wdGlvbnMuaW5nZXN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB2YWwgPSB0aGlzLnByb3AuY2FsbE9wdGlvbkZ1bmN0KCdpbmdlc3QnLCB2YWwpXG4gICAgfVxuICAgIHJldHVybiB2YWxcbiAgfVxuXG4gIGNoZWNrQ2hhbmdlcyAodmFsLCBvbGQpIHtcbiAgICByZXR1cm4gdmFsICE9PSBvbGRcbiAgfVxuXG4gIGNoYW5nZWQgKG9sZCkge1xuICAgIHRoaXMucHJvcC5ldmVudHMuZW1pdCgndXBkYXRlZCcsIG9sZClcbiAgICB0aGlzLnByb3AuZXZlbnRzLmVtaXQoJ2NoYW5nZWQnLCBvbGQpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge1Byb3BlcnR5RGVzY3JpcHRvck1hcH0gb3B0XG4gICAqIEByZXR1cm4ge1Byb3BlcnR5RGVzY3JpcHRvck1hcH1cbiAgICovXG4gIGdldFNjb3BlR2V0dGVyU2V0dGVycyAob3B0KSB7XG4gICAgY29uc3QgcHJvcCA9IHRoaXMucHJvcFxuICAgIG9wdFt0aGlzLnByb3Aub3B0aW9ucy5uYW1lXSA9IG9wdFt0aGlzLnByb3Aub3B0aW9ucy5uYW1lXSB8fCB7fVxuICAgIG9wdFt0aGlzLnByb3Aub3B0aW9ucy5uYW1lXS5zZXQgPSBmdW5jdGlvbiAodmFsKSB7XG4gICAgICByZXR1cm4gcHJvcC5zZXQodmFsKVxuICAgIH1cbiAgICByZXR1cm4gb3B0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlU2V0dGVyXG4iLCJjb25zdCBCYXNlU2V0dGVyID0gcmVxdWlyZSgnLi9CYXNlU2V0dGVyJylcblxuY2xhc3MgQmFzZVZhbHVlU2V0dGVyIGV4dGVuZHMgQmFzZVNldHRlciB7XG4gIHNldCAodmFsKSB7XG4gICAgdmFsID0gdGhpcy5pbmdlc3QodmFsKVxuICAgIGlmICh0aGlzLnByb3AuZ2V0dGVyLmJhc2VWYWx1ZSAhPT0gdmFsKSB7XG4gICAgICB0aGlzLnByb3AuZ2V0dGVyLmJhc2VWYWx1ZSA9IHZhbFxuICAgICAgdGhpcy5wcm9wLmludmFsaWRhdGUoKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVZhbHVlU2V0dGVyXG4iLCJjb25zdCBTaW1wbGVTZXR0ZXIgPSByZXF1aXJlKCcuL1NpbXBsZVNldHRlcicpXG5jb25zdCBDb2xsZWN0aW9uID0gcmVxdWlyZSgnc3BhcmstY29sbGVjdGlvbicpXG5jb25zdCBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnLi4vd2F0Y2hlcnMvQ29sbGVjdGlvblByb3BlcnR5V2F0Y2hlcicpXG5cbmNsYXNzIENvbGxlY3Rpb25TZXR0ZXIgZXh0ZW5kcyBTaW1wbGVTZXR0ZXIge1xuICBpbml0ICgpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKFxuICAgICAge30sXG4gICAgICBDb2xsZWN0aW9uU2V0dGVyLmRlZmF1bHRPcHRpb25zLFxuICAgICAgdHlwZW9mIHRoaXMucHJvcC5vcHRpb25zLmNvbGxlY3Rpb24gPT09ICdvYmplY3QnID8gdGhpcy5wcm9wLm9wdGlvbnMuY29sbGVjdGlvbiA6IHt9XG4gICAgKVxuICAgIHN1cGVyLmluaXQoKVxuICB9XG5cbiAgbG9hZEludGVybmFsV2F0Y2hlciAoKSB7XG4gICAgaWYgKFxuICAgICAgdHlwZW9mIHRoaXMucHJvcC5vcHRpb25zLmNoYW5nZSA9PT0gJ2Z1bmN0aW9uJyB8fFxuICAgICAgdHlwZW9mIHRoaXMucHJvcC5vcHRpb25zLml0ZW1BZGRlZCA9PT0gJ2Z1bmN0aW9uJyB8fFxuICAgICAgdHlwZW9mIHRoaXMucHJvcC5vcHRpb25zLml0ZW1SZW1vdmVkID09PSAnZnVuY3Rpb24nXG4gICAgKSB7XG4gICAgICByZXR1cm4gbmV3IENvbGxlY3Rpb25Qcm9wZXJ0eVdhdGNoZXIoe1xuICAgICAgICBwcm9wZXJ0eTogdGhpcy5wcm9wLFxuICAgICAgICBjYWxsYmFjazogdGhpcy5wcm9wLm9wdGlvbnMuY2hhbmdlLFxuICAgICAgICBvbkFkZGVkOiB0aGlzLnByb3Aub3B0aW9ucy5pdGVtQWRkZWQsXG4gICAgICAgIG9uUmVtb3ZlZDogdGhpcy5wcm9wLm9wdGlvbnMuaXRlbVJlbW92ZWQsXG4gICAgICAgIHNjb3BlOiB0aGlzLnByb3Aub3B0aW9ucy5zY29wZSxcbiAgICAgICAgYXV0b0JpbmQ6IHRydWVcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHN1cGVyLmxvYWRJbnRlcm5hbFdhdGNoZXIoKVxuICAgIH1cbiAgfVxuXG4gIHNldFJhd1ZhbHVlICh2YWwpIHtcbiAgICB0aGlzLnByb3AudmFsdWUgPSB0aGlzLm1ha2VDb2xsZWN0aW9uKHZhbClcbiAgICByZXR1cm4gdGhpcy5wcm9wLnZhbHVlXG4gIH1cblxuICBtYWtlQ29sbGVjdGlvbiAodmFsKSB7XG4gICAgdmFsID0gdGhpcy52YWxUb0FycmF5KHZhbClcbiAgICBjb25zdCBwcm9wID0gdGhpcy5wcm9wXG4gICAgY29uc3QgY29sID0gQ29sbGVjdGlvbi5uZXdTdWJDbGFzcyh0aGlzLm9wdGlvbnMsIHZhbClcbiAgICBjb2wuY2hhbmdlZCA9IGZ1bmN0aW9uIChvbGQpIHtcbiAgICAgIHByb3Auc2V0dGVyLmNoYW5nZWQob2xkKVxuICAgIH1cbiAgICByZXR1cm4gY29sXG4gIH1cblxuICB2YWxUb0FycmF5ICh2YWwpIHtcbiAgICBpZiAodmFsID09IG51bGwpIHtcbiAgICAgIHJldHVybiBbXVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbC50b0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdmFsLnRvQXJyYXkoKVxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgICByZXR1cm4gdmFsLnNsaWNlKClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFt2YWxdXG4gICAgfVxuICB9XG5cbiAgY2hlY2tDaGFuZ2VzICh2YWwsIG9sZCkge1xuICAgIHZhciBjb21wYXJlRnVuY3Rpb25cbiAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5jb21wYXJlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb21wYXJlRnVuY3Rpb24gPSB0aGlzLm9wdGlvbnMuY29tcGFyZVxuICAgIH1cbiAgICByZXR1cm4gKG5ldyBDb2xsZWN0aW9uKHZhbCkpLmNoZWNrQ2hhbmdlcyhvbGQsIHRoaXMub3B0aW9ucy5vcmRlcmVkLCBjb21wYXJlRnVuY3Rpb24pXG4gIH1cbn1cblxuQ29sbGVjdGlvblNldHRlci5kZWZhdWx0T3B0aW9ucyA9IHtcbiAgY29tcGFyZTogZmFsc2UsXG4gIG9yZGVyZWQ6IHRydWVcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uU2V0dGVyXG4iLCJjb25zdCBCYXNlU2V0dGVyID0gcmVxdWlyZSgnLi9CYXNlU2V0dGVyJylcblxuY2xhc3MgTWFudWFsU2V0dGVyIGV4dGVuZHMgQmFzZVNldHRlciB7XG4gIHNldCAodmFsKSB7XG4gICAgdGhpcy5wcm9wLmNhbGxPcHRpb25GdW5jdCgnc2V0JywgdmFsKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFudWFsU2V0dGVyXG4iLCJjb25zdCBCYXNlU2V0dGVyID0gcmVxdWlyZSgnLi9CYXNlU2V0dGVyJylcblxuY2xhc3MgU2ltcGxlU2V0dGVyIGV4dGVuZHMgQmFzZVNldHRlciB7XG4gIHNldCAodmFsKSB7XG4gICAgdmFyIG9sZFxuICAgIHZhbCA9IHRoaXMuaW5nZXN0KHZhbClcbiAgICB0aGlzLnByb3AuZ2V0dGVyLnJldmFsaWRhdGVkKClcbiAgICBpZiAodGhpcy5jaGVja0NoYW5nZXModmFsLCB0aGlzLnByb3AudmFsdWUpKSB7XG4gICAgICBvbGQgPSB0aGlzLnByb3AudmFsdWVcbiAgICAgIHRoaXMuc2V0UmF3VmFsdWUodmFsKVxuICAgICAgdGhpcy5wcm9wLm1hbnVhbCA9IHRydWVcbiAgICAgIHRoaXMuY2hhbmdlZChvbGQpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVTZXR0ZXJcbiIsIlxuY29uc3QgUHJvcGVydHlXYXRjaGVyID0gcmVxdWlyZSgnLi9Qcm9wZXJ0eVdhdGNoZXInKVxuXG5jbGFzcyBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyIGV4dGVuZHMgUHJvcGVydHlXYXRjaGVyIHtcbiAgbG9hZE9wdGlvbnMgKG9wdGlvbnMpIHtcbiAgICBzdXBlci5sb2FkT3B0aW9ucyhvcHRpb25zKVxuICAgIHRoaXMub25BZGRlZCA9IG9wdGlvbnMub25BZGRlZFxuICAgIHRoaXMub25SZW1vdmVkID0gb3B0aW9ucy5vblJlbW92ZWRcbiAgfVxuXG4gIGhhbmRsZUNoYW5nZSAodmFsdWUsIG9sZCkge1xuICAgIG9sZCA9IHZhbHVlLmNvcHkob2xkIHx8IFtdKVxuICAgIGlmICh0eXBlb2YgdGhpcy5jYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5jYWxsYmFjay5jYWxsKHRoaXMuc2NvcGUsIHZhbHVlLCBvbGQpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGhpcy5vbkFkZGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB2YWx1ZS5mb3JFYWNoKChpdGVtLCBpKSA9PiB7XG4gICAgICAgIGlmICghb2xkLmluY2x1ZGVzKGl0ZW0pKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMub25BZGRlZC5jYWxsKHRoaXMuc2NvcGUsIGl0ZW0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGhpcy5vblJlbW92ZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBvbGQuZm9yRWFjaCgoaXRlbSwgaSkgPT4ge1xuICAgICAgICBpZiAoIXZhbHVlLmluY2x1ZGVzKGl0ZW0pKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMub25SZW1vdmVkLmNhbGwodGhpcy5zY29wZSwgaXRlbSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uUHJvcGVydHlXYXRjaGVyXG4iLCJcbmNvbnN0IEJpbmRlciA9IHJlcXVpcmUoJ3NwYXJrLWJpbmRpbmcnKS5CaW5kZXJcbmNvbnN0IFJlZmVyZW5jZSA9IHJlcXVpcmUoJ3NwYXJrLWJpbmRpbmcnKS5SZWZlcmVuY2VcblxuLyoqXG4gKiBAdGVtcGxhdGUgVFxuICovXG5jbGFzcyBQcm9wZXJ0eVdhdGNoZXIgZXh0ZW5kcyBCaW5kZXIge1xuICAvKipcbiAgICogQHR5cGVkZWYge09iamVjdH0gUHJvcGVydHlXYXRjaGVyT3B0aW9uc1xuICAgKiBAcHJvcGVydHkge2ltcG9ydChcIi4vUHJvcGVydHlcIik8VD58c3RyaW5nfSBwcm9wZXJ0eVxuICAgKiBAcHJvcGVydHkge2Z1bmN0aW9uKFQsVCl9IGNhbGxiYWNrXG4gICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2F1dG9CaW5kXVxuICAgKiBAcHJvcGVydHkgeyp9IFtzY29wZV1cbiAgICpcbiAgICogQHBhcmFtIHtQcm9wZXJ0eVdhdGNoZXJPcHRpb25zfSBvcHRpb25zXG4gICAqL1xuICBjb25zdHJ1Y3RvciAob3B0aW9ucykge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG4gICAgdGhpcy5pbnZhbGlkYXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5pbnZhbGlkYXRlKClcbiAgICB9XG4gICAgdGhpcy51cGRhdGVDYWxsYmFjayA9IChvbGQpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZShvbGQpXG4gICAgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5sb2FkT3B0aW9ucyh0aGlzLm9wdGlvbnMpXG4gICAgfVxuICAgIHRoaXMuaW5pdCgpXG4gIH1cblxuICBsb2FkT3B0aW9ucyAob3B0aW9ucykge1xuICAgIHRoaXMuc2NvcGUgPSBvcHRpb25zLnNjb3BlXG4gICAgdGhpcy5wcm9wZXJ0eSA9IG9wdGlvbnMucHJvcGVydHlcbiAgICB0aGlzLmNhbGxiYWNrID0gb3B0aW9ucy5jYWxsYmFja1xuICAgIHRoaXMuYXV0b0JpbmQgPSBvcHRpb25zLmF1dG9CaW5kXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGNvcHlXaXRoIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKE9iamVjdC5hc3NpZ24oe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucykpXG4gIH1cblxuICBpbml0ICgpIHtcbiAgICBpZiAodGhpcy5hdXRvQmluZCkge1xuICAgICAgcmV0dXJuIHRoaXMuY2hlY2tCaW5kKClcbiAgICB9XG4gIH1cblxuICBnZXRQcm9wZXJ0eSAoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnByb3BlcnR5ID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJvcEJ5TmFtZSh0aGlzLnByb3BlcnR5KVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wcm9wZXJ0eVxuICB9XG5cbiAgZ2V0UHJvcEJ5TmFtZSAocHJvcCwgdGFyZ2V0ID0gdGhpcy5zY29wZSkge1xuICAgIGlmICh0YXJnZXQucHJvcGVydGllc01hbmFnZXIgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRhcmdldC5wcm9wZXJ0aWVzTWFuYWdlci5nZXRQcm9wZXJ0eShwcm9wKVxuICAgIH0gZWxzZSBpZiAodGFyZ2V0W3Byb3AgKyAnUHJvcGVydHknXSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGFyZ2V0W3Byb3AgKyAnUHJvcGVydHknXVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIHRoZSBwcm9wZXJ0eSAke3Byb3B9YClcbiAgICB9XG4gIH1cblxuICBjaGVja0JpbmQgKCkge1xuICAgIHJldHVybiB0aGlzLnRvZ2dsZUJpbmQodGhpcy5zaG91bGRCaW5kKCkpXG4gIH1cblxuICBzaG91bGRCaW5kICgpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgY2FuQmluZCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJvcGVydHkoKSAhPSBudWxsXG4gIH1cblxuICBkb0JpbmQgKCkge1xuICAgIHRoaXMudXBkYXRlKClcbiAgICB0aGlzLmdldFByb3BlcnR5KCkuZXZlbnRzLm9uKCdpbnZhbGlkYXRlZCcsIHRoaXMuaW52YWxpZGF0ZUNhbGxiYWNrKVxuICAgIHJldHVybiB0aGlzLmdldFByb3BlcnR5KCkuZXZlbnRzLm9uKCd1cGRhdGVkJywgdGhpcy51cGRhdGVDYWxsYmFjaylcbiAgfVxuXG4gIGRvVW5iaW5kICgpIHtcbiAgICB0aGlzLmdldFByb3BlcnR5KCkuZXZlbnRzLm9mZignaW52YWxpZGF0ZWQnLCB0aGlzLmludmFsaWRhdGVDYWxsYmFjaylcbiAgICByZXR1cm4gdGhpcy5nZXRQcm9wZXJ0eSgpLmV2ZW50cy5vZmYoJ3VwZGF0ZWQnLCB0aGlzLnVwZGF0ZUNhbGxiYWNrKVxuICB9XG5cbiAgZXF1YWxzICh3YXRjaGVyKSB7XG4gICAgcmV0dXJuIHdhdGNoZXIuY29uc3RydWN0b3IgPT09IHRoaXMuY29uc3RydWN0b3IgJiZcbiAgICAgIHdhdGNoZXIgIT0gbnVsbCAmJlxuICAgICAgd2F0Y2hlci5ldmVudCA9PT0gdGhpcy5ldmVudCAmJlxuICAgICAgd2F0Y2hlci5nZXRQcm9wZXJ0eSgpID09PSB0aGlzLmdldFByb3BlcnR5KCkgJiZcbiAgICAgIFJlZmVyZW5jZS5jb21wYXJlVmFsKHdhdGNoZXIuY2FsbGJhY2ssIHRoaXMuY2FsbGJhY2spXG4gIH1cblxuICBpbnZhbGlkYXRlICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQcm9wZXJ0eSgpLmdldCgpXG4gIH1cblxuICB1cGRhdGUgKG9sZCkge1xuICAgIHZhciB2YWx1ZVxuICAgIHZhbHVlID0gdGhpcy5nZXRQcm9wZXJ0eSgpLmdldCgpXG4gICAgcmV0dXJuIHRoaXMuaGFuZGxlQ2hhbmdlKHZhbHVlLCBvbGQpXG4gIH1cblxuICBoYW5kbGVDaGFuZ2UgKHZhbHVlLCBvbGQpIHtcbiAgICByZXR1cm4gdGhpcy5jYWxsYmFjay5jYWxsKHRoaXMuc2NvcGUsIHZhbHVlLCBvbGQpXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvcGVydHlXYXRjaGVyXG4iXX0=
