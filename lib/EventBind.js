(function(definition){EventBind=definition(typeof(Spark)!=="undefined"?Spark:this.Spark);EventBind.definition=definition;if(typeof(module)!=="undefined"&&module!==null){module.exports=EventBind;}else{if(typeof(Spark)!=="undefined"&&Spark!==null){Spark.EventBind=EventBind;}else{if(this.Spark==null){this.Spark={};}this.Spark.EventBind=EventBind;}}})(function(){
var EventBind;
EventBind = (function() {
  function EventBind(event1, target1, callback) {
    this.event = event1;
    this.target = target1;
    this.callback = callback;
    this.binded = false;
  }
  EventBind.prototype.bind = function() {
    if (!this.binded) {
      if (typeof this.target.addEventListener === 'function') {
        this.target.addEventListener(this.event, this.callback);
      } else if (typeof this.target.addListener === 'function') {
        this.target.addListener(this.event, this.callback);
      } else if (typeof this.target.on === 'function') {
        this.target.on(this.event, this.callback);
      } else {
        throw new Error('No function to add event listeners was found');
      }
    }
    return this.binded = true;
  };
  EventBind.prototype.unbind = function() {
    if (this.binded) {
      if (typeof this.target.removeEventListener === 'function') {
        this.target.removeEventListener(this.event, this.callback);
      } else if (typeof this.target.removeListener === 'function') {
        this.target.removeListener(this.event, this.callback);
      } else if (typeof this.target.off === 'function') {
        this.target.off(this.event, this.callback);
      } else {
        throw new Error('No function to remove event listeners was found');
      }
    }
    return this.binded = false;
  };
  EventBind.prototype.equals = function(eventBind) {
    return eventBind.event === this.event && eventBind.target === this.target && eventBind.callback === this.callback;
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
})();
return(EventBind);});