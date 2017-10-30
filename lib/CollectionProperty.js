var Collection, CollectionProperty, PropertyInstance, ref, ref1,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropertyInstance = ((ref = this.Spark) != null ? ref.PropertyInstance : void 0) || require('./PropertyInstance');

Collection = ((ref1 = this.Spark) != null ? ref1.Collection : void 0) || require('./Collection');

CollectionProperty = (function(superClass) {
  extend(CollectionProperty, superClass);

  function CollectionProperty() {
    return CollectionProperty.__super__.constructor.apply(this, arguments);
  }

  CollectionProperty.prototype.ingest = function(val) {
    if (typeof this.property.options.ingest === 'function') {
      val = this.callOptionFunct("ingest", val);
    }
    if (val == null) {
      return [];
    } else if (typeof val.toArray === 'function') {
      return val.toArray();
    } else if (Array.isArray(val)) {
      return val.slice();
    } else {
      return [val];
    }
  };

  CollectionProperty.prototype.output = function() {
    var col, prop, value;
    value = this.value;
    if (typeof this.property.options.output === 'function') {
      value = this.callOptionFunct("output", this.value);
    }
    prop = this;
    col = Collection.newSubClass(this.property.options.collection, value);
    col.changed = function(old) {
      return prop.changed(old);
    };
    return col;
  };

  return CollectionProperty;

})(PropertyInstance);

if (typeof Spark !== "undefined" && Spark !== null) {
  Spark.CollectionProperty = CollectionProperty;
}

if (typeof module !== "undefined" && module !== null) {
  module.exports = CollectionProperty;
} else {
  if (this.Spark == null) {
    this.Spark = {};
  }
  this.Spark.CollectionProperty = CollectionProperty;
}
