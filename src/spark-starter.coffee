#= require <_start>
#= require <Element>

#--- Local ---
#--- Concatened ---
if module?
  module.exports = Spark
else 
  @Spark = Spark
#--- Concatened end ---
#--- Local end ---


#--- Standalone ---
if module?
  module.exports = {
    Element: require('./Element'),
    Property: require('./Property'),
    PropertyInstance: require('./PropertyInstance'),
    Invalidator: require('./Invalidator'),
    EventBind: require('./EventBind'),
    Collection: require('./Collection'),
  }
#--- Standalone end ---