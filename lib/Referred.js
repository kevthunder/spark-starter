(function(definition){var Referred=definition(typeof Spark!=="undefined"?Spark:this.Spark);Referred.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Referred;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Referred=Referred;}else{if(this.Spark==null){this.Spark={};}this.Spark.Referred=Referred;}}})(function(){
var Referred;
Referred = (function() {
  class Referred {
    compareRefered(refered) {
      return this.constructor.compareRefered(refered, this);
    }
    getRef() {}
    static compareRefered(obj1, obj2) {
      return obj1 === obj2 || ((obj1 != null) && (obj2 != null) && obj1.constructor === obj2.constructor && this.compareRef(obj1.ref, obj2.ref));
    }
    static compareRef(ref1, ref2) {
      return (ref1 != null) && (ref2 != null) && (ref1 === ref2 || (Array.isArray(ref1) && Array.isArray(ref1) && ref1.every((val, i) => {
        return this.compareRefered(ref1[i], ref2[i]);
      })) || (typeof ref1 === "object" && typeof ref2 === "object" && Object.keys(ref1).join() === Object.keys(ref2).join() && Object.keys(ref1).every((key) => {
        return this.compareRefered(ref1[key], ref2[key]);
      })));
    }
  };
  Object.defineProperty(Referred.prototype, 'ref', {
    get: function() {
      return this.getRef();
    }
  });
  return Referred;
}).call(this);
return(Referred);});