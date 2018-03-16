if(module){
  module.exports = {
    Binder: require('./Binder.js'),
    Collection: require('./Collection.js'),
    CollectionProperty: require('./CollectionProperty.js'),
    ComposedProperty: require('./ComposedProperty.js'),
    Element: require('./Element.js'),
    EventBind: require('./EventBind.js'),
    Invalidator: require('./Invalidator.js'),
    Property: require('./Property.js'),
    PropertyInstance: require('./PropertyInstance.js'),
    Updater: require('./Updater.js')
  };
}