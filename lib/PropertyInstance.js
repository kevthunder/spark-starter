(function(definition){var PropertyInstance=definition(typeof Spark!=="undefined"?Spark:this.Spark);PropertyInstance.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=PropertyInstance;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.PropertyInstance=PropertyInstance;}else{if(this.Spark==null){this.Spark={};}this.Spark.PropertyInstance=PropertyInstance;}}})(function(){
var PropertyInstance;
PropertyInstance = class PropertyInstance {
  constructor(property, obj) {
    this.property = property;
    this.obj = obj;
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
      prop.instanceType = class extends PropertyInstance {};
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
return(PropertyInstance);});
//# sourceMappingURL=maps/PropertyInstance.js.map
