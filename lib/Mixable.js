(function(definition){var Mixable=definition(typeof Spark!=="undefined"?Spark:this.Spark);Mixable.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Mixable;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Mixable=Mixable;}else{if(this.Spark==null){this.Spark={};}this.Spark.Mixable=Mixable;}}})(function(){
var Mixable,
  indexOf = [].indexOf;
Mixable = (function() {
  class Mixable {
    static extend(obj) {
      this.Extension.make(obj, this);
      if (obj.prototype != null) {
        return this.Extension.make(obj.prototype, this.prototype);
      }
    }
    static include(obj) {
      return this.Extension.make(obj, this.prototype);
    }
  };
  Mixable.Extension = {
    make: function(source, target) {
      var i, key, len, ref;
      ref = this.getExtensionProperties(source, target);
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
        target[key] = source[key];
      }
      target.extensions = (target.extensions || []).concat([source]);
      if (typeof source.extended === 'function') {
        return source.extended(target);
      }
    },
    alwaysFinal: ['extended', 'extensions', '__super__', 'constructor'],
    getExtensionProperties: function(source, target) {
      var alwaysFinal, props, targetChain;
      alwaysFinal = this.alwaysFinal;
      targetChain = this.getPrototypeChain(target);
      props = [];
      this.getPrototypeChain(source).every(function(obj) {
        var exclude;
        if (!targetChain.includes(obj)) {
          exclude = alwaysFinal;
          if (source.getFinalProperties != null) {
            exclude = exclude.concat(source.getFinalProperties());
          }
          if (typeof obj === 'function') {
            exclude = exclude.concat(["length", "prototype", "name"]);
          }
          props = props.concat(Object.getOwnPropertyNames(obj).filter((key) => {
            return !target.hasOwnProperty(key) && key.substr(0, 2) !== "__" && indexOf.call(exclude, key) < 0;
          }));
          return true;
        }
      });
      return props;
    },
    getPrototypeChain: function(obj) {
      var basePrototype, chain;
      chain = [];
      basePrototype = Object.getPrototypeOf(Object);
      while (true) {
        chain.push(obj);
        if (!((obj = Object.getPrototypeOf(obj)) && obj !== Object && obj !== basePrototype)) {
          break;
        }
      }
      return chain;
    }
  };
  return Mixable;
}).call(this);
return(Mixable);});
//# sourceMappingURL=maps/Mixable.js.map
