(function(definition){var CollectionPropertyWatcher=definition(typeof Spark!=="undefined"?Spark:this.Spark);CollectionPropertyWatcher.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=CollectionPropertyWatcher;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.CollectionPropertyWatcher=CollectionPropertyWatcher;}else{if(this.Spark==null){this.Spark={};}this.Spark.CollectionPropertyWatcher=CollectionPropertyWatcher;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var PropertyWatcher = dependencies.hasOwnProperty("PropertyWatcher") ? dependencies.PropertyWatcher : require('./PropertyWatcher');
var CollectionPropertyWatcher;
CollectionPropertyWatcher = class CollectionPropertyWatcher extends PropertyWatcher {
  loadOptions(options) {
    super.loadOptions(options);
    this.onAdded = options.onAdded;
    return this.onRemoved = options.onRemoved;
  }

  handleChange(value, old) {
    old = value.copy(old || []);
    if (typeof this.callback === 'function') {
      this.callback.call(this.scope, old);
    }
    if (typeof this.onAdded === 'function') {
      value.forEach((item, i) => {
        if (!old.includes(item)) {
          return this.onAdded.call(this.scope, item);
        }
      });
    }
    if (typeof this.onRemoved === 'function') {
      return old.forEach((item, i) => {
        if (!value.includes(item)) {
          return this.onRemoved.call(this.scope, item);
        }
      });
    }
  }

};

return(CollectionPropertyWatcher);});