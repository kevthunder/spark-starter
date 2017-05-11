var EventBind, Invalidator, pluck, ref;

EventBind = ((ref = this.Spark) != null ? ref.EventBind : void 0) || require('./EventBind');

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
  function Invalidator(obj, property) {
    this.obj = obj;
    this.property = property;
    this.invalidationEvents = [];
    this.recycled = [];
    this.invalidateCallback = (function(_this) {
      return function() {
        _this.invalidate();
        return null;
      };
    })(this);
  }

  Invalidator.prototype.invalidate = function() {
    var functName;
    functName = 'invalidate' + this.property.charAt(0).toUpperCase() + this.property.slice(1);
    if (this.obj[functName] != null) {
      return this.obj[functName]();
    } else {
      return this.obj[this.property] = null;
    }
  };

  Invalidator.prototype.fromEvent = function(event, target) {
    if (target == null) {
      target = this;
    }
    if (!this.invalidationEvents.some(function(eventBind) {
      return eventBind.event === event && eventBind.target === target;
    })) {
      return this.invalidationEvents.push(pluck(this.recycled, function(eventBind) {
        return eventBind.event === event && eventBind.target === target;
      }) || new EventBind(event, target, this.invalidateCallback));
    }
  };

  Invalidator.prototype.fromValue = function(val, event, target) {
    if (target == null) {
      target = this;
    }
    this.fromEvent(event, target);
    return val;
  };

  Invalidator.prototype.fromProperty = function(propertyName, target) {
    var maj;
    if (target == null) {
      target = this;
    }
    maj = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
    return this.fromValue(target[propertyName], 'changed' + maj, target);
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

  Invalidator.prototype.unbind = function() {
    return this.invalidationEvents.forEach(function(eventBind) {
      return eventBind.unbind();
    });
  };

  return Invalidator;

})();

if (typeof Spark !== "undefined" && Spark !== null) {
  Spark.Invalidator = Invalidator;
}

if (typeof module !== "undefined" && module !== null) {
  module.exports = Invalidator;
} else {
  if (this.Spark == null) {
    this.Spark = {};
  }
  this.Spark.Invalidator = Invalidator;
}
