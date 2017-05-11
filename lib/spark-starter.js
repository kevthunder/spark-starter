if (typeof module !== "undefined" && module !== null) {
  module.exports = {
    Element: require('./Element'),
    Invalidator: require('./Invalidator'),
    EventBind: require('./EventBind')
  };
}
