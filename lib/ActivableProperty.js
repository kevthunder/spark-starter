(function(definition){var ActivableProperty=definition(typeof Spark!=="undefined"?Spark:this.Spark);ActivableProperty.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=ActivableProperty;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.ActivableProperty=ActivableProperty;}else{if(this.Spark==null){this.Spark={};}this.Spark.ActivableProperty=ActivableProperty;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : require('./Invalidator');
var PropertyInstance = dependencies.hasOwnProperty("PropertyInstance") ? dependencies.PropertyInstance : require('./PropertyInstance');
var ActivableProperty, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;
ActivableProperty = (function(superClass) {
  extend(ActivableProperty, superClass);

  function ActivableProperty() {
    return ActivableProperty.__super__.constructor.apply(this, arguments);
  }

  ActivableProperty.prototype.activableGet = function() {
    return this.get();
  };

  ActivableProperty.prototype.activableGet = function() {
    var out;
    if (this.invalidator) {
      this.invalidator.validateUnknowns();
    }
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
  };

  ActivableProperty.prototype.isActive = function() {
    return true;
  };

  ActivableProperty.prototype.manualActive = function() {
    return this.active;
  };

  ActivableProperty.prototype.callbackActive = function() {
    var invalidator;
    invalidator = this.activeInvalidator || new Invalidator(this, this.obj);
    invalidator.recycle((function(_this) {
      return function(invalidator, done) {
        _this.active = _this.callOptionFunct(_this.activeFunct, invalidator);
        done();
        if (_this.active || invalidator.isEmpty()) {
          invalidator.unbind();
          return _this.activeInvalidator = null;
        } else {
          _this.invalidator = invalidator;
          _this.activeInvalidator = invalidator;
          return invalidator.bind();
        }
      };
    })(this));
    return this.active;
  };

  ActivableProperty.prototype.activeChanged = function(old) {
    return this.changed(old);
  };

  ActivableProperty.prototype.activableChanged = function(old) {
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
  };

  ActivableProperty.compose = function(prop) {
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
  };

  return ActivableProperty;

})(PropertyInstance);

return(ActivableProperty);});