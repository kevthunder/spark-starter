(function(definition){var PropertyWatcher=definition(typeof Spark!=="undefined"?Spark:this.Spark);PropertyWatcher.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=PropertyWatcher;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.PropertyWatcher=PropertyWatcher;}else{if(this.Spark==null){this.Spark={};}this.Spark.PropertyWatcher=PropertyWatcher;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Invalidated = dependencies.hasOwnProperty("Invalidated") ? dependencies.Invalidated : require('./Invalidated');
var PropertyWatcher;
// todo: dont use Invalidator
PropertyWatcher = class PropertyWatcher extends Invalidated {
  loadOptions(options) {
    this.scope = options.scope;
    if (options.loaderAsScope && (options.loader != null)) {
      this.scope = options.loader;
    }
    this.property = options.property;
    return this.callback = options.callback;
  }

  handleUpdate(invalidator) {
    var old, value;
    old = this.old;
    this.old = value = invalidator.prop(this.property);
    return this.handleChange(value, old);
  }

  handleChange(value, old) {
    return this.callback.call(this.scope, old);
  }

};

return(PropertyWatcher);});