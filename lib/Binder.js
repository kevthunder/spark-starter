(function(definition){var Binder=definition(typeof Spark!=="undefined"?Spark:this.Spark);Binder.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Binder;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Binder=Binder;}else{if(this.Spark==null){this.Spark={};}this.Spark.Binder=Binder;}}})(function(){
var Binder;
Binder = (function() {
  function Binder() {}
  Binder.prototype.bind = function() {
    if (!this.binded && (this.callback != null) && (this.target != null)) {
      this.doBind();
    }
    return this.binded = true;
  };
  Binder.prototype.doBind = function() {
    throw new Error('Not implemented');
  };
  Binder.prototype.unbind = function() {
    if (this.binded && (this.callback != null) && (this.target != null)) {
      this.doUnbind();
    }
    return this.binded = false;
  };
  Binder.prototype.doUnbind = function() {
    throw new Error('Not implemented');
  };
  Binder.prototype.equals = function(binder) {
    return this.constructor.compareRefered(binder, this);
  };
  Binder.compareRefered = function(obj1, obj2) {
    return obj1 === obj2 || ((obj1 != null) && (obj2 != null) && obj1.constructor === obj2.constructor && this.compareRef(obj1.ref, obj2.ref));
  };
  Binder.compareRef = function(ref1, ref2) {
    return (ref1 != null) && (ref2 != null) && (ref1 === ref2 || (Array.isArray(ref1) && Array.isArray(ref1) && ref1.every((function(_this) {
      return function(val, i) {
        return _this.compareRefered(ref1[i], ref2[i]);
      };
    })(this))) || (typeof ref1 === "object" && typeof ref2 === "object" && Object.keys(ref1).join() === Object.keys(ref2).join() && Object.keys(ref1).every((function(_this) {
      return function(key) {
        return _this.compareRefered(ref1[key], ref2[key]);
      };
    })(this))));
  };
  return Binder;
})();
return(Binder);});