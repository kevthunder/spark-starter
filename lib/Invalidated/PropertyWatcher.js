(function(definition){var PropertyWatcher=definition(typeof Spark!=="undefined"?Spark:this.Spark);PropertyWatcher.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=PropertyWatcher;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.PropertyWatcher=PropertyWatcher;}else{if(this.Spark==null){this.Spark={};}this.Spark.PropertyWatcher=PropertyWatcher;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Binder = dependencies.hasOwnProperty("Binder") ? dependencies.Binder : require('../Binder');
var PropertyWatcher;
PropertyWatcher = class PropertyWatcher extends Binder {
  constructor(options) {
    super();
    this.invalidateCallback = () => {
      return this.invalidate();
    };
    this.updateCallback = (old) => {
      return this.update(old);
    };
    if (options != null) {
      this.loadOptions(options);
    }
    if (!((options != null ? options.initByLoader : void 0) && (options.loader != null))) {
      this.init();
    }
  }

  loadOptions(options) {
    this.scope = options.scope;
    if (options.loaderAsScope && (options.loader != null)) {
      this.scope = options.loader;
    }
    this.property = options.property;
    this.callback = options.callback;
    return this.autoBind = options.autoBind;
  }

  init() {
    if (this.autoBind) {
      return this.checkBind();
    }
  }

  getProperty() {
    if (typeof this.property === "string") {
      this.property = this.scope.getPropertyInstance(this.property);
    }
    return this.property;
  }

  checkBind() {
    return this.toggleBind(this.shouldBind());
  }

  shouldBind() {
    return true;
  }

  canBind() {
    return this.getProperty() != null;
  }

  doBind() {
    this.update();
    this.getProperty().on('invalidated', this.invalidateCallback);
    return this.getProperty().on('updated', this.updateCallback);
  }

  doUnbind() {
    this.getProperty().off('invalidated', this.invalidateCallback);
    return this.getProperty().off('updated', this.updateCallback);
  }

  getRef() {
    if (typeof this.property === "string") {
      return {
        property: this.property,
        target: this.scope,
        callback: this.callback
      };
    } else {
      return {
        property: this.property.property.name,
        target: this.property.obj,
        callback: this.callback
      };
    }
  }

  invalidate() {
    return this.getProperty().get();
  }

  update(old) {
    var value;
    value = this.getProperty().get();
    return this.handleChange(value, old);
  }

  handleChange(value, old) {
    return this.callback.call(this.scope, old);
  }

};

return(PropertyWatcher);});