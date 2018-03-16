(function(definition){var Binder=definition(typeof Spark!=="undefined"?Spark:this.Spark);Binder.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Binder;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Binder=Binder;}else{if(this.Spark==null){this.Spark={};}this.Spark.Binder=Binder;}}})(function(){
var Binder;
Binder = (function() {
  function Binder(target, callback1) {
    this.target = target;
    this.callback = callback1;
    this.binded = false;
  }
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
    return binder.constructor === this.constructor && binder.target === this.target && this.compareCallback(binder.callback);
  };
  Binder.prototype.compareCallback = function(callback) {
    return callback === this.callback || ((callback.maker != null) && callback.maker === this.callback.maker && callback.uses.length === this.callback.uses.length && this.callback.uses.every(function(arg, i) {
      return arg === callback.uses[i];
    }));
  };
  return Binder;
})();
return(Binder);});