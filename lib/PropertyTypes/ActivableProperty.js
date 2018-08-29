(function(definition){var ActivableProperty=definition(typeof Spark!=="undefined"?Spark:this.Spark);ActivableProperty.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=ActivableProperty;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.ActivableProperty=ActivableProperty;}else{if(this.Spark==null){this.Spark={};}this.Spark.ActivableProperty=ActivableProperty;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : require('../Invalidator');
var BasicProperty = dependencies.hasOwnProperty("BasicProperty") ? dependencies.BasicProperty : require('./BasicProperty');
var ActivableProperty;
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

return(ActivableProperty);});
//# sourceMappingURL=../maps/PropertyTypes/ActivableProperty.js.map
