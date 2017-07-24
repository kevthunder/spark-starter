if (typeof module !== "undefined" && module !== null) {
  module.exports = {
    Element: require('./Element'),
    Property: require('./Property'),
    PropertyInstance: require('./PropertyInstance'),
    Invalidator: require('./Invalidator'),
    EventBind: require('./EventBind'),
    Collection: require('./Collection')
  };
}
