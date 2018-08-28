(function(definition){var CalculatedProperty=definition(typeof Spark!=="undefined"?Spark:this.Spark);CalculatedProperty.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=CalculatedProperty;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.CalculatedProperty=CalculatedProperty;}else{if(this.Spark==null){this.Spark={};}this.Spark.CalculatedProperty=CalculatedProperty;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : require('./Invalidator');
var DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : require('./DynamicProperty');
var CalculatedProperty;
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

return(CalculatedProperty);});
//# sourceMappingURL=maps/CalculatedProperty.js.map
