(function(definition){var ActivablePropertyWatcher=definition(typeof Spark!=="undefined"?Spark:this.Spark);ActivablePropertyWatcher.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=ActivablePropertyWatcher;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.ActivablePropertyWatcher=ActivablePropertyWatcher;}else{if(this.Spark==null){this.Spark={};}this.Spark.ActivablePropertyWatcher=ActivablePropertyWatcher;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var PropertyWatcher = dependencies.hasOwnProperty("PropertyWatcher") ? dependencies.PropertyWatcher : require('./PropertyWatcher');
var Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : require('../Invalidator');
var ActivablePropertyWatcher;
ActivablePropertyWatcher = class ActivablePropertyWatcher extends PropertyWatcher {
  loadOptions(options) {
    super.loadOptions(options);
    return this.active = options.active;
  }

  shouldBind() {
    var active;
    if (this.active != null) {
      if (this.invalidator == null) {
        this.invalidator = new Invalidator(this, this.scope);
        this.invalidator.callback = () => {
          return this.checkBind();
        };
      }
      this.invalidator.recycle();
      active = this.active(this.invalidator);
      this.invalidator.endRecycle();
      this.invalidator.bind();
      return active;
    } else {
      return true;
    }
  }

};

return(ActivablePropertyWatcher);});