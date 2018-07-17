(function(definition){var Updater=definition(typeof Spark!=="undefined"?Spark:this.Spark);Updater.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Updater;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Updater=Updater;}else{if(this.Spark==null){this.Spark={};}this.Spark.Updater=Updater;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Binder = dependencies.hasOwnProperty("Binder") ? dependencies.Binder : require('./Binder');
var Updater, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;
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

Updater.Binder = (function(superClass) {
  extend(Binder, superClass);

  function Binder(target, callback1) {
    this.target = target;
    this.callback = callback1;
    this.ref = {
      target: this.target,
      callback: this.callback
    };
  }

  Binder.prototype.doBind = function() {
    return this.target.addCallback(this.callback);
  };

  Binder.prototype.doUnbind = function() {
    return this.target.removeCallback(this.callback);
  };

  return Binder;

})(Binder);

return(Updater);});