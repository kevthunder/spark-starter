#= require <_start>
#= require <Element>

#--- Concatened ---
if module?
  module.exports = Spark
else 
  @Spark = Spark
#--- Concatened end ---


#--- Standalone ---
if module?
  module.exports = {
    Element: require('./Element'),
    Invalidator: require('./Invalidator'),
    EventBind: require('./EventBind'),
  }
#--- Standalone end ---