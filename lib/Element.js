var Element, Invalidator, afterAddListener, callChange, ref, registerCalculatedProperty,
  slice = [].slice,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Invalidator = ((ref = this.Spark) != null ? ref.Invalidator : void 0) || require('./Invalidator');

afterAddListener = function(event) {
  var maj, match, prop;
  if (match = event.match(/^changed(\w*)$/)) {
    maj = match[1];
    prop = maj.charAt(0).toLowerCase() + maj.slice(1);
    if (typeof this['invalidate' + maj] === 'function' && this[prop + 'Calculated'] === false) {
      return this['get' + maj]();
    }
  }
};

registerCalculatedProperty = function(obj, prop, calcul) {
  var maj, overrided;
  maj = prop.charAt(0).toUpperCase() + prop.slice(1);
  if (calcul != null) {
    obj['calcul' + maj] = calcul;
  }
  if (obj['calcul' + maj] != null) {
    obj[prop + 'Calculated'] = false;
    obj['invalidate' + maj] = function() {
      var old;
      if (this[prop + 'Calculated']) {
        this[prop + 'Calculated'] = false;
        if (this['immediate' + maj] || (typeof this.getListeners === 'function' && this.getListeners(prop + 'Changed').length > 0)) {
          old = this['_' + prop];
          this['get' + maj]();
          if (old !== this['_' + prop]) {
            return callChange(this, prop, old);
          }
        } else if (this[prop + 'Invalidator'] != null) {
          return this[prop + 'Invalidator'].unbind();
        }
      }
    };
    if (typeof this.addListener === 'function' && typeof this.afterAddListener !== 'function') {
      this.afterAddListener = afterAddListener;
      overrided = this.addListener;
      return this.addListener = function(evt, listener) {
        overrided(evt, listener);
        return this.afterAddListener(evt);
      };
    }
  }
};

callChange = function(obj, prop, old) {
  if (typeof obj[prop + 'Changed'] === 'function') {
    obj[prop + 'Changed'](old);
  }
  if (typeof obj.emitEvent === 'function') {
    return obj.emitEvent(prop + 'Changed', [old]);
  }
};

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
      } else {
        this.prototype['immediate' + maj] = desc.immediate === true;
        registerCalculatedProperty(this.prototype, prop, desc.calcul);
        this.prototype['get' + maj] = function() {
          if (typeof this['calcul' + maj] === 'function' && !this[prop + 'Calculated']) {
            if (this[prop + 'Invalidator'] == null) {
              this[prop + 'Invalidator'] = new Invalidator(this, prop);
            }
            this[prop + 'Invalidator'].recycle((function(_this) {
              return function(invalidator) {
                _this['_' + prop] = _this['calcul' + maj](invalidator);
                if (invalidator.isEmpty()) {
                  return _this[prop + 'Invalidator'] = null;
                } else {
                  return invalidator.bind();
                }
              };
            })(this));
            this[prop + 'Calculated'] = true;
          }
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
      } else {
        if (desc.change != null) {
          this.prototype[prop + 'Changed'] = desc.change;
        }
        if (desc.ingest != null) {
          this.prototype['ingest' + maj] = desc.ingest;
        }
        this.prototype['set' + maj] = function(val) {
          var old;
          if (typeof this['ingest' + maj] === 'function') {
            val = this['ingest' + maj](val);
          }
          if (this['_' + prop] !== val) {
            old = this['_' + prop];
            this['_' + prop] = val;
            callChange(this, prop, old);
          }
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
