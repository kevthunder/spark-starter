(function(definition){var UpdatedProperty=definition(typeof Spark!=="undefined"?Spark:this.Spark);UpdatedProperty.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=UpdatedProperty;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.UpdatedProperty=UpdatedProperty;}else{if(this.Spark==null){this.Spark={};}this.Spark.UpdatedProperty=UpdatedProperty;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : require('../Invalidator');
var DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : require('./DynamicProperty');
var Overrider = dependencies.hasOwnProperty("Overrider") ? dependencies.Overrider : require('../Overrider');
var UpdatedProperty;
UpdatedProperty = (function() {
  class UpdatedProperty extends DynamicProperty {
    initRevalidate() {
      this.revalidateCallback = () => {
        this.updating = true;
        this.get();
        this.getUpdater().unbind();
        if (this.pendingChanges) {
          this.changed(this.pendingOld);
        }
        return this.updating = false;
      };
      return this.revalidateCallback.owner = this;
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

    static compose(prop) {
      if (prop.options.updater != null) {
        return prop.instanceType.extend(UpdatedProperty);
      }
    }

  };

  UpdatedProperty.extend(Overrider);

  UpdatedProperty.overrides({
    init: function() {
      this.init.withoutUpdatedProperty();
      return this.initRevalidate();
    },
    _invalidateNotice: function() {
      var res;
      res = this._invalidateNotice.withoutUpdatedProperty();
      if (res) {
        this.getUpdater().bind();
      }
      return res;
    },
    isImmediate: function() {
      return false;
    },
    changed: function(old) {
      if (this.updating) {
        this.pendingChanges = false;
        this.pendingOld = void 0;
        this.changed.withoutUpdatedProperty(old);
      } else {
        this.pendingChanges = true;
        if (typeof this.pendingOld === 'undefined') {
          this.pendingOld = old;
        }
        this.getUpdater().bind();
      }
      return this;
    }
  });

  return UpdatedProperty;

}).call(this);

return(UpdatedProperty);});
//# sourceMappingURL=../maps/PropertyTypes/UpdatedProperty.js.map
