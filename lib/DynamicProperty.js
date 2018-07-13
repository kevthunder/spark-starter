(function(definition){var DynamicProperty=definition(typeof Spark!=="undefined"?Spark:this.Spark);DynamicProperty.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=DynamicProperty;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.DynamicProperty=DynamicProperty;}else{if(this.Spark==null){this.Spark={};}this.Spark.DynamicProperty=DynamicProperty;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : require('./Invalidator');
var PropertyInstance = dependencies.hasOwnProperty("PropertyInstance") ? dependencies.PropertyInstance : require('./PropertyInstance');
var DynamicProperty, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;
DynamicProperty = (function(superClass) {
  extend(DynamicProperty, superClass);

  function DynamicProperty() {
    return DynamicProperty.__super__.constructor.apply(this, arguments);
  }

  DynamicProperty.prototype.init = function() {
    DynamicProperty.__super__.init.call(this);
    return this.initRevalidate();
  };

  DynamicProperty.prototype.initRevalidate = function() {
    return this.revalidateCallback = (function(_this) {
      return function() {
        return _this.get();
      };
    })(this);
  };

  DynamicProperty.prototype.callbackGet = function() {
    var res;
    res = this.callOptionFunct("get");
    this.revalidated();
    return res;
  };

  DynamicProperty.prototype.invalidate = function() {
    if (this.calculated || this.active === false) {
      this.calculated = false;
      this._invalidateNotice();
    }
    return this;
  };

  DynamicProperty.prototype.revalidate = function() {
    DynamicProperty.__super__.revalidate.call(this);
    return this.revalidateUpdater();
  };

  DynamicProperty.prototype.revalidateUpdater = function() {
    if (this.getUpdater() != null) {
      return this.getUpdater().unbind();
    }
  };

  DynamicProperty.prototype._invalidateNotice = function() {
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
  };

  DynamicProperty.prototype.getUpdater = function() {
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
  };

  DynamicProperty.prototype.isImmediate = function() {
    return this.property.options.immediate !== false && (this.property.options.immediate === true || (typeof this.property.options.immediate === 'function' ? this.callOptionFunct("immediate") : (this.getUpdater() == null) && (this.hasChangedEvents() || this.hasChangedFunctions())));
  };

  DynamicProperty.compose = function(prop) {
    if (typeof prop.options.get === 'function' || typeof prop.options.calcul === 'function' || typeof prop.options.active === 'function') {
      if (prop.instanceType == null) {
        prop.instanceType = (function(superClass1) {
          extend(_Class, superClass1);

          function _Class() {
            return _Class.__super__.constructor.apply(this, arguments);
          }

          return _Class;

        })(DynamicProperty);
      }
    }
    if (typeof prop.options.get === 'function') {
      return prop.instanceType.prototype.get = this.prototype.callbackGet;
    }
  };

  return DynamicProperty;

})(PropertyInstance);

return(DynamicProperty);});