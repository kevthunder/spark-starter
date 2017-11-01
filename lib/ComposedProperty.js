var Collection, ComposedProperty, Invalidator, PropertyInstance, ref, ref1, ref2,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropertyInstance = ((ref = this.Spark) != null ? ref.PropertyInstance : void 0) || require('./PropertyInstance');

Invalidator = ((ref1 = this.Spark) != null ? ref1.Invalidator : void 0) || require('./Invalidator');

Collection = ((ref2 = this.Spark) != null ? ref2.Collection : void 0) || require('./Collection');

ComposedProperty = (function(superClass) {
  extend(ComposedProperty, superClass);

  function ComposedProperty() {
    return ComposedProperty.__super__.constructor.apply(this, arguments);
  }

  ComposedProperty.prototype.init = function() {
    ComposedProperty.__super__.init.call(this);
    if (this.property.options.hasOwnProperty('default')) {
      this["default"] = this.property.options["default"];
    } else {
      this["default"] = this.value = true;
    }
    this.members = new ComposedProperty.Members(this.property.options.members);
    this.members.changed = (function(_this) {
      return function(old) {
        return _this.invalidate();
      };
    })(this);
    return this.join = typeof this.property.options.composed === 'function' ? this.property.options.composed : this.property.options["default"] === false ? ComposedProperty.joinFunctions.or : ComposedProperty.joinFunctions.and;
  };

  ComposedProperty.prototype.calcul = function() {
    if (!this.invalidator) {
      this.invalidator = new Invalidator(this, this.obj);
    }
    this.invalidator.recycle((function(_this) {
      return function(invalidator, done) {
        _this.value = _this.members.reduce(function(prev, member) {
          var val;
          val = typeof member === 'function' ? member(_this.invalidator) : member;
          return _this.join(prev, val);
        }, _this["default"]);
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

  ComposedProperty.bind = function(target, prop) {
    PropertyInstance.bind(target, prop);
    return Object.defineProperty(target, prop.name + 'Members', {
      configurable: true,
      get: function() {
        return prop.getInstance(this).members;
      }
    });
  };

  ComposedProperty.joinFunctions = {
    and: function(a, b) {
      return a && b;
    },
    or: function(a, b) {
      return a || b;
    }
  };

  return ComposedProperty;

})(PropertyInstance);

ComposedProperty.Members = (function(superClass) {
  extend(Members, superClass);

  function Members() {
    return Members.__super__.constructor.apply(this, arguments);
  }

  Members.prototype.addPropertyRef = function(name, obj) {
    var fn;
    if (this.findPropertyRefIndex(name, obj) === -1) {
      fn = function(invalidator) {
        return invalidator.prop(name, obj);
      };
      fn.ref = {
        name: name,
        obj: obj
      };
      return this.push(fn);
    }
  };

  Members.prototype.findPropertyRefIndex = function(name, obj) {
    return this._array.findIndex(function(member) {
      return (member.ref != null) && member.ref.obj === obj && member.ref.name === name;
    });
  };

  Members.prototype.removePropertyRef = function(name, obj) {
    var index, old;
    index = this.findPropertyRefIndex(name, obj);
    if (index !== -1) {
      old = this.toArray();
      this._array.splice(index, 1);
      return this.changed(old);
    }
  };

  return Members;

})(Collection);

if (typeof Spark !== "undefined" && Spark !== null) {
  Spark.ComposedProperty = ComposedProperty;
}

if (typeof module !== "undefined" && module !== null) {
  module.exports = ComposedProperty;
} else {
  if (this.Spark == null) {
    this.Spark = {};
  }
  this.Spark.ComposedProperty = ComposedProperty;
}
