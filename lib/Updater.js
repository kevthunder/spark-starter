(function(definition){Updater=definition(typeof(Spark)!=="undefined"?Spark:this.Spark);Updater.definition=definition;if(typeof(module)!=="undefined"&&module!==null){module.exports=Updater;}else{if(typeof(Spark)!=="undefined"&&Spark!==null){Spark.Updater=Updater;}else{if(this.Spark==null){this.Spark={};}this.Spark.Updater=Updater;}}})(function(){
var Updater;
Updater = (function() {
  function Updater() {
    this.callbacks = [];
  }
  Updater.prototype.update = function() {
    return this.callbacks.forEach(function(callback) {
      return callback();
    });
  };
  Updater.prototype.addCallback = function(callback) {
    if (!this.callbacks.includes(callback)) {
      return this.callbacks.push(callback);
    }
  };
  Updater.prototype.removeCallback = function(callback) {
    var index;
    index = this.callbacks.indexOf(callback);
    if (index !== -1) {
      return this.callbacks.splice(index, 1);
    }
  };
  Updater.prototype.getBinder = function() {
    return new Updater.Binder(this);
  };
  return Updater;
})();
Updater.Binder = (function() {
  function Binder(target) {
    this.target = target;
    this.binded = false;
  }
  Binder.prototype.bind = function() {
    if (!this.binded && (this.callback != null)) {
      this.target.addCallback(this.callback);
    }
    return this.binded = true;
  };
  Binder.prototype.unbind = function() {
    if (this.binded && (this.callback != null)) {
      this.target.removeCallback(this.callback);
    }
    return this.binded = false;
  };
  return Binder;
})();
return(Updater);});