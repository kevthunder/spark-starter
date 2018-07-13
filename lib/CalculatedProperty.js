(function(definition){var CalculatedProperty=definition(typeof Spark!=="undefined"?Spark:this.Spark);CalculatedProperty.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=CalculatedProperty;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.CalculatedProperty=CalculatedProperty;}else{if(this.Spark==null){this.Spark={};}this.Spark.CalculatedProperty=CalculatedProperty;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : require('./Invalidator');
var DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : require('./DynamicProperty');
var CalculatedProperty, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;
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

return(CalculatedProperty);});