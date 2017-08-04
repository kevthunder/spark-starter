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
        throw 'No function to add a event listener found';
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
        throw 'No function to remove a event listener found';
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

  return EventBind;

})();

if (typeof Spark !== "undefined" && Spark !== null) {
  Spark.EventBind = EventBind;
}

if (typeof module !== "undefined" && module !== null) {
  module.exports = EventBind;
} else {
  if (this.Spark == null) {
    this.Spark = {};
  }
  this.Spark.EventBind = EventBind;
}
