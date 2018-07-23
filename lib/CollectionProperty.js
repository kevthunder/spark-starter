(function(definition){var CollectionProperty=definition(typeof Spark!=="undefined"?Spark:this.Spark);CollectionProperty.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=CollectionProperty;}else{if(typeof Spark!=="undefined"&&Spark!==null){Spark.CollectionProperty=CollectionProperty;}else{if(this.Spark==null){this.Spark={};}this.Spark.CollectionProperty=CollectionProperty;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var DynamicProperty = dependencies.hasOwnProperty("DynamicProperty") ? dependencies.DynamicProperty : require('./DynamicProperty');
var Collection = dependencies.hasOwnProperty("Collection") ? dependencies.Collection : require('./Collection');
var CollectionProperty, extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;
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

  CollectionProperty.prototype.checkChangedItems = function(val, old) {
    var compareFunction;
    if (typeof this.collectionOptions.compare === 'function') {
      compareFunction = this.collectionOptions.compare;
    }
    return (new Collection(val)).checkChanges(old, this.collectionOptions.ordered, compareFunction);
  };

  CollectionProperty.prototype.output = function() {
    var col, prop, value;
    value = this.value;
    if (typeof this.property.options.output === 'function') {
      value = this.callOptionFunct("output", this.value);
    }
    prop = this;
    col = Collection.newSubClass(this.collectionOptions, value);
    col.changed = function(old) {
      return prop.changed(old);
    };
    return col;
  };

  CollectionProperty.prototype.callChangedFunctions = function(old) {
    if (typeof this.property.options.itemAdded === 'function') {
      this.value.forEach((function(_this) {
        return function(item, i) {
          if (!old.includes(item)) {
            return _this.callOptionFunct("itemAdded", item, i);
          }
        };
      })(this));
    }
    if (typeof this.property.options.itemRemoved === 'function') {
      old.forEach((function(_this) {
        return function(item, i) {
          if (!_this.value.includes(item)) {
            return _this.callOptionFunct("itemRemoved", item, i);
          }
        };
      })(this));
    }
    return CollectionProperty.__super__.callChangedFunctions.call(this, old);
  };

  CollectionProperty.prototype.hasChangedFunctions = function() {
    return CollectionProperty.__super__.hasChangedFunctions.call(this) || typeof this.property.options.itemAdded === 'function' || typeof this.property.options.itemRemoved === 'function';
  };

  CollectionProperty.defaultCollectionOptions = {
    compare: false,
    ordered: true
  };

  CollectionProperty.compose = function(prop) {
    if (prop.options.collection != null) {
      prop.instanceType = (function(superClass1) {
        extend(_Class, superClass1);

        function _Class() {
          return _Class.__super__.constructor.apply(this, arguments);
        }

        return _Class;

      })(CollectionProperty);
      prop.instanceType.prototype.collectionOptions = Object.assign({}, this.defaultCollectionOptions, typeof prop.options.collection === 'object' ? prop.options.collection : {});
      if (prop.options.collection.compare != null) {
        return prop.instanceType.prototype.checkChanges = this.prototype.checkChangedItems;
      }
    }
  };

  return CollectionProperty;

})(DynamicProperty);

return(CollectionProperty);});