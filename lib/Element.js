(function(definition){var Element=definition(typeof Spark!=="undefined"?Spark:this.Spark);Element.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Element;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Element=Element;}else{if(this.Spark==null){this.Spark={};}this.Spark.Element=Element;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Property = dependencies.hasOwnProperty("Property") ? dependencies.Property : require('./Property');
var Element, slice = [].slice,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
Element = (function() {
  function Element() {}

  Element.elementKeywords = ['extended', 'included', 'constructor'];

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
          _this[name].apply(_this, args);
          return null;
        };
      })(this);
    }
  };

  Element.extend = function(obj) {
    var key, ref, value;
    for (key in obj) {
      value = obj[key];
      if (indexOf.call(Element.elementKeywords, key) < 0) {
        this[key] = value;
      }
    }
    if (obj.prototype != null) {
      this.include(obj.prototype);
    }
    if ((ref = obj.extended) != null) {
      ref.apply(this);
    }
    return this;
  };

  Element.getIncludableProperties = function(obj) {
    var exclude, props;
    exclude = Element.elementKeywords;
    if (obj._properties != null) {
      exclude = exclude.concat(obj._properties.map(function(prop) {
        return prop.name;
      }));
      exclude.push("_properties");
    }
    props = [];
    while (true) {
      props = props.concat(Object.getOwnPropertyNames(obj).filter((function(_this) {
        return function(key) {
          return !_this.prototype.hasOwnProperty(key) && key.substr(0, 2) !== "__" && indexOf.call(exclude, key) < 0 && indexOf.call(props, key) < 0;
        };
      })(this)));
      if (!((obj = Object.getPrototypeOf(obj)) && obj !== Object && obj !== Element.prototype)) {
        break;
      }
    }
    return props;
  };

  Element.include = function(obj) {
    var i, j, key, len, len1, property, ref, ref1, ref2;
    ref = this.getIncludableProperties(obj);
    for (i = 0, len = ref.length; i < len; i++) {
      key = ref[i];
      this.prototype[key] = obj[key];
    }
    if (obj._properties != null) {
      ref1 = obj._properties;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        property = ref1[j];
        this.property(property.name, Object.assign({}, property.options));
      }
    }
    if ((ref2 = obj.included) != null) {
      ref2.apply(this);
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

return(Element);});