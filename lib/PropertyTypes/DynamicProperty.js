(function(definition){var DynamicProperty=definition(typeof Spark!=="undefined"?Spark:this.Spark);DynamicProperty.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=DynamicProperty;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.DynamicProperty=DynamicProperty;}else{if(this.Spark==null){this.Spark={};}this.Spark.DynamicProperty=DynamicProperty;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : require('../Invalidator');
var BasicProperty = dependencies.hasOwnProperty("BasicProperty") ? dependencies.BasicProperty : require('./BasicProperty');
var DynamicProperty;
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

  revalidated() {
    super.revalidated();
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
    if (typeof prop.options.get === 'function') {
      return prop.instanceType.prototype.get = this.prototype.callbackGet;
    }
  }

};

return(DynamicProperty);});
//# sourceMappingURL=../maps/PropertyTypes/DynamicProperty.js.map
