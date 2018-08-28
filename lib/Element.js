(function(definition){var Element=definition(typeof Spark!=="undefined"?Spark:this.Spark);Element.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Element;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Element=Element;}else{if(this.Spark==null){this.Spark={};}this.Spark.Element=Element;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Property = dependencies.hasOwnProperty("Property") ? dependencies.Property : require('./Property');
var Element, indexOf = [].indexOf;
Element = (function() {
  class Element {
    tap(name) {
      var args;
      args = Array.prototype.slice.call(arguments);
      if (typeof name === 'function') {
        name.apply(this, args.slice(1));
      } else {
        this[name].apply(this, args.slice(1));
      }
      return this;
    }

    callback(name) {
      if (this._callbacks == null) {
        this._callbacks = {};
      }
      if (this._callbacks[name] != null) {
        return this._callbacks[name];
      } else {
        return this._callbacks[name] = (...args) => {
          this[name].apply(this, args);
          return null;
        };
      }
    }

    static extend(obj) {
      var i, key, len, ref, ref1;
      ref = this.getExtendableProperties(obj);
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
        this[key] = obj[key];
      }
      if (obj.prototype != null) {
        this.include(obj.prototype);
      }
      if ((ref1 = obj.extended) != null) {
        ref1.apply(this);
      }
      return this;
    }

    static getExtendableProperties(obj) {
      var exclude, props;
      exclude = Element.elementKeywords;
      props = [];
      while (true) {
        props = props.concat(Object.getOwnPropertyNames(obj).filter((key) => {
          return !this.hasOwnProperty(key) && key.substr(0, 2) !== "__" && indexOf.call(exclude, key) < 0 && (key !== "length" && key !== "prototype" && key !== "name");
        }));
        if (!((obj = Object.getPrototypeOf(obj)) && obj !== Object && obj !== Element)) {
          break;
        }
      }
      return props;
    }

    static getIncludableProperties(obj) {
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
        props = props.concat(Object.getOwnPropertyNames(obj).filter((key) => {
          return !this.prototype.hasOwnProperty(key) && key.substr(0, 2) !== "__" && indexOf.call(exclude, key) < 0 && indexOf.call(props, key) < 0;
        }));
        if (!((obj = Object.getPrototypeOf(obj)) && obj !== Object && obj !== Element.prototype)) {
          break;
        }
      }
      return props;
    }

    static include(obj) {
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
    }

    static property(prop, desc) {
      return (new Property(prop, desc)).bind(this.prototype);
    }

    static properties(properties) {
      var desc, prop, results;
      results = [];
      for (prop in properties) {
        desc = properties[prop];
        results.push(this.property(prop, desc));
      }
      return results;
    }

  };

  Element.elementKeywords = ['extended', 'included', '__super__', 'constructor'];

  return Element;

}).call(this);

return(Element);});
//# sourceMappingURL=maps/Element.js.map
