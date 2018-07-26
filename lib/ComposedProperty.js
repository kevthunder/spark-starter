(function(definition){var ComposedProperty=definition(typeof Spark!=="undefined"?Spark:this.Spark);ComposedProperty.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=ComposedProperty;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.ComposedProperty=ComposedProperty;}else{if(this.Spark==null){this.Spark={};}this.Spark.ComposedProperty=ComposedProperty;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var CalculatedProperty = dependencies.hasOwnProperty("CalculatedProperty") ? dependencies.CalculatedProperty : require('./CalculatedProperty');
var Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : require('./Invalidator');
var Collection = dependencies.hasOwnProperty("Collection") ? dependencies.Collection : require('./Collection');
var ComposedProperty, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;
ComposedProperty = (function(superClass) {
  extend(ComposedProperty, superClass);

  function ComposedProperty() {
    return ComposedProperty.__super__.constructor.apply(this, arguments);
  }

  ComposedProperty.prototype.init = function() {
    ComposedProperty.__super__.init.call(this);
    return this.initComposed();
  };

  ComposedProperty.prototype.initComposed = function() {
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

  ComposedProperty.compose = function(prop) {
    if (prop.options.composed != null) {
      prop.instanceType = (function(superClass1) {
        extend(_Class, superClass1);

        function _Class() {
          return _Class.__super__.constructor.apply(this, arguments);
        }

        return _Class;

      })(ComposedProperty);
      return prop.instanceType.prototype.get = this.prototype.calculatedGet;
    }
  };

  ComposedProperty.bind = function(target, prop) {
    CalculatedProperty.bind(target, prop);
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

})(CalculatedProperty);

ComposedProperty.Members = (function(superClass) {
  extend(Members, superClass);

  function Members() {
    return Members.__super__.constructor.apply(this, arguments);
  }

  Members.prototype.addPropertyRef = function(name, obj) {
    var fn;
    if (this.findRefIndex(name, obj) === -1) {
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

  Members.prototype.addValueRef = function(val, name, obj) {
    var fn;
    if (this.findRefIndex(name, obj) === -1) {
      fn = function(invalidator) {
        return val;
      };
      fn.ref = {
        name: name,
        obj: obj,
        val: val
      };
      return this.push(fn);
    }
  };

  Members.prototype.setValueRef = function(val, name, obj) {
    var fn, i, ref;
    i = this.findRefIndex(name, obj);
    if (i === -1) {
      return this.addValueRef(val, name, obj);
    } else if (this.get(i).ref.val !== val) {
      ref = {
        name: name,
        obj: obj,
        val: val
      };
      fn = function(invalidator) {
        return val;
      };
      fn.ref = ref;
      return this.set(i, fn);
    }
  };

  Members.prototype.getValueRef = function(name, obj) {
    return this.findByRef(name, obj).ref.val;
  };

  Members.prototype.addFunctionRef = function(fn, name, obj) {
    if (this.findRefIndex(name, obj) === -1) {
      fn.ref = {
        name: name,
        obj: obj
      };
      return this.push(fn);
    }
  };

  Members.prototype.findByRef = function(name, obj) {
    return this._array[this.findRefIndex(name, obj)];
  };

  Members.prototype.findRefIndex = function(name, obj) {
    return this._array.findIndex(function(member) {
      return (member.ref != null) && member.ref.obj === obj && member.ref.name === name;
    });
  };

  Members.prototype.removeRef = function(name, obj) {
    var index, old;
    index = this.findRefIndex(name, obj);
    if (index !== -1) {
      old = this.toArray();
      this._array.splice(index, 1);
      return this.changed(old);
    }
  };

  return Members;

})(Collection);

return(ComposedProperty);});