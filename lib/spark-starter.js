if(module){
  module.exports = {
    Binder: require('./Binder.js'),
    Collection: require('./Collection.js'),
    Element: require('./Element.js'),
    EventBind: require('./EventBind.js'),
    EventEmitter: require('./EventEmitter.js'),
    Invalidator: require('./Invalidator.js'),
    Loader: require('./Loader.js'),
    Mixable: require('./Mixable.js'),
    Overrider: require('./Overrider.js'),
    Property: require('./Property.js'),
    PropertyOwner: require('./PropertyOwner.js'),
    Referred: require('./Referred.js'),
    Updater: require('./Updater.js'),
    ActivablePropertyWatcher: require('./Invalidated/ActivablePropertyWatcher.js'),
    CollectionPropertyWatcher: require('./Invalidated/CollectionPropertyWatcher.js'),
    Invalidated: require('./Invalidated/Invalidated.js'),
    PropertyWatcher: require('./Invalidated/PropertyWatcher.js'),
    BasicProperty: require('./PropertyTypes/BasicProperty.js'),
    CalculatedProperty: require('./PropertyTypes/CalculatedProperty.js'),
    CollectionProperty: require('./PropertyTypes/CollectionProperty.js'),
    ComposedProperty: require('./PropertyTypes/ComposedProperty.js'),
    DynamicProperty: require('./PropertyTypes/DynamicProperty.js'),
    InvalidatedProperty: require('./PropertyTypes/InvalidatedProperty.js')
  };
}