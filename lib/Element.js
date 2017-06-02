var Element, Property, ref,
  slice = [].slice,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Property = ((ref = this.Spark) != null ? ref.Property : void 0) || require('./Property');

Element = (function() {
  function Element() {}

  Element.elementKeywords = ['extended', 'included'];

  Element.prototype.tap = function(name) {
    var args;
    args = Array.prototype.slice.call(arguments);
    if (typeof name === 'function') {
      name.apply(this, args.slice(1));
    } else {
      this[name].apply(this, args.slice(1));
    }
    return this;
  };

  Element.prototype.callback = function(name) {
    if (this._callbacks == null) {
      this._callbacks = {};
    }
    if (this._callbacks[name] != null) {
      return this._callbacks[name];
    } else {
      return this._callbacks[name] = (function(_this) {
        return function() {
          var args;
          args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          _this[name].call(_this, args);
          return null;
        };
      })(this);
    }
  };

  Element.extend = function(obj) {
    var key, ref1, value;
    for (key in obj) {
      value = obj[key];
      if (indexOf.call(Element.elementKeywords, key) < 0) {
        this[key] = value;
      }
    }
    if ((ref1 = obj.extended) != null) {
      ref1.apply(this);
    }
    return this;
  };

  Element.include = function(obj) {
    var key, ref1, value;
    for (key in obj) {
      value = obj[key];
      if (indexOf.call(Element.elementKeywords, key) < 0) {
        this.prototype[key] = value;
      }
    }
    if ((ref1 = obj.included) != null) {
      ref1.apply(this);
    }
    return this;
  };

  Element.property = function(prop, desc) {
    return (new Property(prop, desc)).bind(this.prototype);
  };

  Element.properties = function(properties) {
    var desc, prop, results;
    results = [];
    for (prop in properties) {
      desc = properties[prop];
      results.push(this.property(prop, desc));
    }
    return results;
  };

  return Element;

})();

if (typeof Spark !== "undefined" && Spark !== null) {
  Spark.Element = Element;
}

if (typeof module !== "undefined" && module !== null) {
  module.exports = Element;
} else {
  if (this.Spark == null) {
    this.Spark = {};
  }
  this.Spark.Element = Element;
}
