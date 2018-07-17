(function(definition){var EventBind=definition(typeof Spark!=="undefined"?Spark:this.Spark);EventBind.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=EventBind;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.EventBind=EventBind;}else{if(this.Spark==null){this.Spark={};}this.Spark.EventBind=EventBind;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Binder = dependencies.hasOwnProperty("Binder") ? dependencies.Binder : require('./Binder');
var EventBind, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;
EventBind = (function(superClass) {
  extend(EventBind, superClass);

  function EventBind(event1, target1, callback) {
    this.event = event1;
    this.target = target1;
    this.callback = callback;
    this.ref = {
      event: this.event,
      target: this.target,
      callback: this.callback
    };
  }

  EventBind.prototype.doBind = function() {
    if (typeof this.target.addEventListener === 'function') {
      return this.target.addEventListener(this.event, this.callback);
    } else if (typeof this.target.addListener === 'function') {
      return this.target.addListener(this.event, this.callback);
    } else if (typeof this.target.on === 'function') {
      return this.target.on(this.event, this.callback);
    } else {
      throw new Error('No function to add event listeners was found');
    }
  };

  EventBind.prototype.doUnbind = function() {
    if (typeof this.target.removeEventListener === 'function') {
      return this.target.removeEventListener(this.event, this.callback);
    } else if (typeof this.target.removeListener === 'function') {
      return this.target.removeListener(this.event, this.callback);
    } else if (typeof this.target.off === 'function') {
      return this.target.off(this.event, this.callback);
    } else {
      throw new Error('No function to remove event listeners was found');
    }
  };

  EventBind.prototype.equals = function(eventBind) {
    return EventBind.__super__.equals.call(this, eventBind) && eventBind.event === this.event;
  };

  EventBind.prototype.match = function(event, target) {
    return event === this.event && target === this.target;
  };

  EventBind.checkEmitter = function(emitter, fatal) {
    if (fatal == null) {
      fatal = true;
    }
    if (typeof emitter.addEventListener === 'function' || typeof emitter.addListener === 'function' || typeof emitter.on === 'function') {
      return true;
    } else if (fatal) {
      throw new Error('No function to add event listeners was found');
    } else {
      return false;
    }
  };

  return EventBind;

})(Binder);

return(EventBind);});