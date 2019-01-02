(function(definition){var BasicProperty=definition(typeof Spark!=="undefined"?Spark:this.Spark);BasicProperty.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=BasicProperty;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.BasicProperty=BasicProperty;}else{if(this.Spark==null){this.Spark={};}this.Spark.BasicProperty=BasicProperty;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Mixable = dependencies.hasOwnProperty("Mixable") ? dependencies.Mixable : require('../Mixable');
var EventEmitter = dependencies.hasOwnProperty("EventEmitter") ? dependencies.EventEmitter : require('../EventEmitter');
var Loader = dependencies.hasOwnProperty("Loader") ? dependencies.Loader : require('../Loader');
var PropertyWatcher = dependencies.hasOwnProperty("PropertyWatcher") ? dependencies.PropertyWatcher : require('../Invalidated/PropertyWatcher');
var Referred = dependencies.hasOwnProperty("Referred") ? dependencies.Referred : require('../Referred');
var BasicProperty;
BasicProperty = (function() {
  class BasicProperty extends Mixable {
    constructor(property, obj) {
      super();
      this.property = property;
      this.obj = obj;
    }

    init() {
      var preload;
      this.value = this.ingest(this.default);
      this.calculated = false;
      preload = this.constructor.getPreload(this.obj, this.property, this);
      if (preload.length > 0) {
        return Loader.loadMany(preload);
      }
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
      this.emitEvent('updated', [old]);
      this.emitEvent('changed', [old]);
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
      prop.instanceType.prototype.default = prop.options.default;
      return prop.instanceType.prototype.initiated = typeof prop.options.default !== 'undefined';
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
      var preload, ref, ref1;
      preload = [];
      if (typeof prop.options.change === "function") {
        ref = {
          prop: prop.name,
          callback: prop.options.change,
          context: 'change'
        };
        if (!((ref1 = target.preloaded) != null ? ref1.find(function(loaded) {
          return Referred.compareRef(ref, loaded.ref) && !instance || (loaded.instance != null);
        }) : void 0)) {
          preload.push({
            type: PropertyWatcher,
            loaderAsScope: true,
            scope: target,
            property: instance || prop.name,
            initByLoader: true,
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

return(BasicProperty);});