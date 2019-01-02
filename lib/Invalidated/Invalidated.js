(function(definition){var Invalidated=definition(typeof Spark!=="undefined"?Spark:this.Spark);Invalidated.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Invalidated;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.Invalidated=Invalidated;}else{if(this.Spark==null){this.Spark={};}this.Spark.Invalidated=Invalidated;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : require('../Invalidator');
var Invalidated;
Invalidated = class Invalidated {
  constructor(options) {
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
    return this.callback = options.callback;
  }

  init() {
    return this.update();
  }

  unknown() {
    return this.invalidator.validateUnknowns();
  }

  invalidate() {
    return this.update();
  }

  update() {
    if (this.invalidator == null) {
      this.invalidator = new Invalidator(this, this.scope);
    }
    this.invalidator.recycle();
    this.handleUpdate(this.invalidator);
    this.invalidator.endRecycle();
    this.invalidator.bind();
    return this;
  }

  handleUpdate(invalidator) {
    if (this.scope != null) {
      return this.callback.call(this.scope, invalidator);
    } else {
      return this.callback(invalidator);
    }
  }

  destroy() {
    if (this.invalidator) {
      return this.invalidator.unbind();
    }
  }

};

return(Invalidated);});