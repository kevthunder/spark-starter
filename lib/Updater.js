(function(definition){Updater=definition(typeof(Spark)!=="undefined"?Spark:this.Spark);Updater.definition=definition;if(typeof(module)!=="undefined"&&module!==null){module.exports=Updater;}else{if(typeof(Spark)!=="undefined"&&Spark!==null){Spark.Updater=Updater;}else{if(this.Spark==null){this.Spark={};}this.Spark.Updater=Updater;}}})(function(){
var Updater;
Updater = (function() {
  function Updater() {
    this.callbacks = [];
    this.next = [];
    this.updating = false;
  }
  Updater.prototype.update = function() {
    var callback;
    this.updating = true;
    this.next = this.callbacks.slice();
    while (this.callbacks.length > 0) {
      callback = this.callbacks.shift();
      callback();
    }
    this.callbacks = this.next;
    this.updating = false;
    return this;
  };
  Updater.prototype.addCallback = function(callback) {
    if (!this.callbacks.includes(callback)) {
      this.callbacks.push(callback);
    }
    if (this.updating && !this.next.includes(callback)) {
      return this.next.push(callback);
    }
  };
  Updater.prototype.nextTick = function(callback) {
    if (this.updating) {
      if (!this.next.includes(callback)) {
        return this.next.push(callback);
      }
    } else {
      return this.addCallback(callback);
    }
  };
  Updater.prototype.removeCallback = function(callback) {
    var index;
    index = this.callbacks.indexOf(callback);
    if (index !== -1) {
      this.callbacks.splice(index, 1);
    }
    index = this.next.indexOf(callback);
    if (index !== -1) {
      return this.next.splice(index, 1);
    }
  };
  Updater.prototype.getBinder = function() {
    return new Updater.Binder(this);
  };
  Updater.prototype.destroy = function() {
    this.callbacks = [];
    return this.next = [];
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