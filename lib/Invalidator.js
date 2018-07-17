(function(definition){var Invalidator=definition(typeof Spark!=="undefined"?Spark:this.Spark);Invalidator.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Invalidator;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Invalidator=Invalidator;}else{if(this.Spark==null){this.Spark={};}this.Spark.Invalidator=Invalidator;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var EventBind = dependencies.hasOwnProperty("EventBind") ? dependencies.EventBind : require('./EventBind');
var Invalidator, pluck;
pluck = function(arr, fn) {
  var found, index;
  index = arr.findIndex(fn);
  if (index > -1) {
    found = arr[index];
    arr.splice(index, 1);
    return found;
  } else {
    return null;
  }
};

Invalidator = (function() {
  Invalidator.strict = true;

  function Invalidator(property, obj) {
    this.property = property;
    this.obj = obj != null ? obj : null;
    this.invalidationEvents = [];
    this.recycled = [];
    this.unknowns = [];
    this.strict = this.constructor.strict;
    this.invalidateCallback = (function(_this) {
      return function() {
        _this.invalidate();
        return null;
      };
    })(this);
  }

  Invalidator.prototype.invalidate = function() {
    var functName;
    if (typeof this.property === "function") {
      return this.property();
    } else if (typeof this.property.invalidate === "function") {
      return this.property.invalidate();
    } else if (typeof this.property === "string") {
      functName = 'invalidate' + this.property.charAt(0).toUpperCase() + this.property.slice(1);
      if (typeof this.obj[functName] === "function") {
        return this.obj[functName]();
      } else {
        return this.obj[this.property] = null;
      }
    }
  };

  Invalidator.prototype.unknown = function() {
    if (typeof this.property.unknown === "function") {
      return this.property.unknown();
    } else {
      return this.invalidate();
    }
  };

  Invalidator.prototype.addEventBind = function(event, target, callback) {
    return this.addBinder(new EventBind(event, target, callback));
  };

  Invalidator.prototype.addBinder = function(binder) {
    if (binder.callback == null) {
      binder.callback = this.invalidateCallback;
    }
    if (!this.invalidationEvents.some(function(eventBind) {
      return eventBind.equals(binder);
    })) {
      return this.invalidationEvents.push(pluck(this.recycled, function(eventBind) {
        return eventBind.equals(binder);
      }) || binder);
    }
  };

  Invalidator.prototype.getUnknownCallback = function(prop, target) {
    var callback;
    callback = (function(_this) {
      return function() {
        return _this.addUnknown(function() {
          return target[prop];
        }, prop, target);
      };
    })(this);
    callback.maker = arguments.callee;
    callback.uses = Array.from(arguments);
    return callback;
  };

  Invalidator.prototype.addUnknown = function(fn, prop, target) {
    if (!this.findUnknown(prop, target)) {
      fn.ref = {
        "prop": prop,
        "target": target
      };
      this.unknowns.push(fn);
      return this.unknown();
    }
  };

  Invalidator.prototype.findUnknown = function(prop, target) {
    if ((prop != null) || (target != null)) {
      return this.unknowns.find(function(unknown) {
        return unknown.ref.prop === prop && unknown.ref.target === target;
      });
    }
  };

  Invalidator.prototype.event = function(event, target) {
    if (target == null) {
      target = this.obj;
    }
    if (this.checkEmitter(target)) {
      return this.addEventBind(event, target);
    }
  };

  Invalidator.prototype.value = function(val, event, target) {
    if (target == null) {
      target = this.obj;
    }
    this.event(event, target);
    return val;
  };

  Invalidator.prototype.prop = function(prop, target) {
    if (target == null) {
      target = this.obj;
    }
    if (typeof prop !== 'string') {
      throw new Error('Property name must be a string');
    }
    if (this.checkEmitter(target)) {
      this.addEventBind(prop + 'Invalidated', target, this.getUnknownCallback(prop, target));
      return this.value(target[prop], prop + 'Updated', target);
    } else {
      return target[prop];
    }
  };

  Invalidator.prototype.propInitiated = function(prop, target) {
    var initiated;
    if (target == null) {
      target = this.obj;
    }
    initiated = target.getPropertyInstance(prop).initiated;
    if (!initiated && this.checkEmitter(target)) {
      this.event(prop + 'Updated', target);
    }
    return initiated;
  };

  Invalidator.prototype.funct = function(funct) {
    var invalidator, res;
    invalidator = new Invalidator((function(_this) {
      return function() {
        return _this.addUnknown(function() {
          var res2;
          res2 = funct(invalidator);
          if (res !== res2) {
            return _this.invalidate();
          }
        }, invalidator);
      };
    })(this));
    res = funct(invalidator);
    this.invalidationEvents.push(invalidator);
    return res;
  };

  Invalidator.prototype.validateUnknowns = function(prop, target) {
    var unknowns;
    if (target == null) {
      target = this.obj;
    }
    unknowns = this.unknowns;
    this.unknowns = [];
    return unknowns.forEach(function(unknown) {
      return unknown();
    });
  };

  Invalidator.prototype.isEmpty = function() {
    return this.invalidationEvents.length === 0;
  };

  Invalidator.prototype.bind = function() {
    return this.invalidationEvents.forEach(function(eventBind) {
      return eventBind.bind();
    });
  };

  Invalidator.prototype.recycle = function(callback) {
    var done, res;
    this.recycled = this.invalidationEvents;
    this.invalidationEvents = [];
    done = (function(_this) {
      return function() {
        _this.recycled.forEach(function(eventBind) {
          return eventBind.unbind();
        });
        return _this.recycled = [];
      };
    })(this);
    if (typeof callback === "function") {
      if (callback.length > 1) {
        return callback(this, done);
      } else {
        res = callback(this);
        done();
        return res;
      }
    } else {
      return done;
    }
  };

  Invalidator.prototype.checkEmitter = function(emitter) {
    return EventBind.checkEmitter(emitter, this.strict);
  };

  Invalidator.prototype.equals = function(val) {
    return val === this;
  };

  Invalidator.prototype.unbind = function() {
    return this.invalidationEvents.forEach(function(eventBind) {
      return eventBind.unbind();
    });
  };

  return Invalidator;

})();

return(Invalidator);});