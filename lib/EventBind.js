var EventBind;

EventBind = (function() {
  function EventBind(event, target, callback) {
    this.event = event;
    this.target = target;
    this.callback = callback;
    this.binded = false;
  }

  EventBind.prototype.bind = function() {
    if (!this.binded) {
      this.target.addListener(this.event, this.callback);
    }
    return this.binded = true;
  };

  EventBind.prototype.unbind = function() {
    if (this.binded) {
      this.target.removeListener(this.event, this.callback);
    }
    return this.binded = false;
  };

  EventBind.prototype.equals = function(eventBind) {
    return eventBind.event === this.event && eventBind.target === this.target && eventBind.callback === this.callback;
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
