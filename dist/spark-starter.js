(function() {
  var Element,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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

    Element.extend = function(obj) {
      var key, ref, value;
      for (key in obj) {
        value = obj[key];
        if (indexOf.call(Element.elementKeywords, key) < 0) {
          this[key] = value;
        }
      }
      if ((ref = obj.extended) != null) {
        ref.apply(this);
      }
      return this;
    };

    Element.include = function(obj) {
      var key, ref, value;
      for (key in obj) {
        value = obj[key];
        if (indexOf.call(Element.elementKeywords, key) < 0) {
          this.prototype[key] = value;
        }
      }
      if ((ref = obj.included) != null) {
        ref.apply(this);
      }
      return this;
    };

    Element.property = function(prop, desc) {
      var maj;
      maj = prop.charAt(0).toUpperCase() + prop.slice(1);
      if (desc["default"] != null) {
        this.prototype['_' + prop] = desc["default"];
      } else {
        this.prototype['_' + prop] = null;
      }
      if (!((desc.get != null) && desc.get === false)) {
        if (desc.get != null) {
          this.prototype['get' + maj] = desc.get;
        } else if (desc.init != null) {
          this.prototype['init' + maj] = desc.init;
          this.prototype['get' + maj] = function() {
            if (this['_' + prop] == null) {
              this['_' + prop] = this['init' + maj]();
            }
            return this['_' + prop];
          };
        } else {
          this.prototype['get' + maj] = function() {
            return this['_' + prop];
          };
        }
        desc.get = function() {
          return this['get' + maj]();
        };
      }
      if (!((desc.set != null) && desc.set === false)) {
        if (desc.set != null) {
          this.prototype['set' + maj] = desc.set;
        } else if (desc.change != null) {
          this.prototype['change' + maj] = desc.change;
          this.prototype['set' + maj] = function(val) {
            var old;
            if (this['_' + prop] !== val) {
              old = this['_' + prop];
              this['_' + prop] = val;
              this['change' + maj](old);
            }
            return this;
          };
        } else {
          this.prototype['set' + maj] = function(val) {
            this['_' + prop] = val;
            return this;
          };
        }
        desc.set = function(val) {
          return this['set' + maj](val);
        };
      }
      return Object.defineProperty(this.prototype, prop, desc);
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

  if (this.exports != null) {
    this.exports = Element;
  } else {
    if (this.Spark == null) {
      this.Spark = {};
    }
    this.Spark.Element = Element;
  }

}).call(this);
