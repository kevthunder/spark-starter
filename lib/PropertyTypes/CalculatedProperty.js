(function(definition){var CalculatedProperty=definition(typeof Spark!=="undefined"?Spark:this.Spark);CalculatedProperty.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=CalculatedProperty;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.CalculatedProperty=CalculatedProperty;}else{if(this.Spark==null){this.Spark={};}this.Spark.CalculatedProperty=CalculatedProperty;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : require('../Invalidator');
var DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : require('./DynamicProperty');
var Overrider = dependencies.hasOwnProperty("Overrider") ? dependencies.Overrider : require('../Overrider');
var CalculatedProperty;
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
          } else if (typeof this.obj.emitEvent === 'function') {
            this.obj.emitEvent(this.updateEventName, [old]);
          }
        }
      }
      return this.output();
    }
  });

  return CalculatedProperty;

}).call(this);

return(CalculatedProperty);});
//# sourceMappingURL=../maps/PropertyTypes/CalculatedProperty.js.map
