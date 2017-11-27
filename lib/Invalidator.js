(function(definition){Invalidator=definition(typeof(Spark)!=="undefined"?Spark:this.Spark);Invalidator.definition=definition;if(typeof(module)!=="undefined"&&module!==null){module.exports=Invalidator;}else{if(typeof(Spark)!=="undefined"&&Spark!==null){Spark.Invalidator=Invalidator;}else{if(this.Spark==null){this.Spark={};}this.Spark.Invalidator=Invalidator;}}})(function(dependencies){if(dependencies==null){dependencies={};}
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
    if (typeof this.property.invalidate === "function") {
      return this.property.invalidate();
    } else {
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
    if (!this.invalidationEvents.some(function(eventBind) {
      return eventBind.match(event, target);
    })) {
      return this.invalidationEvents.push(pluck(this.recycled, function(eventBind) {
        return eventBind.match(event, target);
      }) || new EventBind(event, target, callback));
    }
  };

  Invalidator.prototype.getUnknownCallback = function(prop, target) {
    return (function(_this) {
      return function() {
        if (!_this.unknowns.some(function(unknown) {
          return unknown.prop === prop && unknown.target === target;
        })) {
          _this.unknowns.push({
            "prop": prop,
            "target": target
          });
          return _this.unknown();
        }
      };
    })(this);
  };

  Invalidator.prototype.event = function(event, target) {
    if (target == null) {
      target = this.obj;
    }
    if (this.checkEmitter(target)) {
      return this.addEventBind(event, target, this.invalidateCallback);
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

  Invalidator.prototype.validateUnknowns = function(prop, target) {
    var unknowns;
    if (target == null) {
      target = this.obj;
    }
    unknowns = this.unknowns;
    this.unknowns = [];
    return unknowns.forEach(function(unknown) {
      return unknown.target[unknown.prop];
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

  Invalidator.prototype.unbind = function() {
    return this.invalidationEvents.forEach(function(eventBind) {
      return eventBind.unbind();
    });
  };

  return Invalidator;

})();

return(Invalidator);});