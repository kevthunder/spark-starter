#= require <Property>
#--- Standalone ---
Property = @Spark?.Property or require('./Property')
#--- Standalone end ---

class Element
  @elementKeywords = ['extended', 'included']
  
  tap: (name) ->
    args = Array::slice.call(arguments)
    if typeof name == 'function'
      name.apply this, args.slice(1)
    else
      @[name].apply this, args.slice(1)
    this
  
  callback: (name) ->
    unless @_callbacks?
      @_callbacks = {}
    if @_callbacks[name]?
      @_callbacks[name]
    else
      @_callbacks[name] = (args...)=> 
        this[name].call(this,args)
        null
  
  @extend: (obj) ->
    for key, value of obj when key not in Element.elementKeywords
      @[key] = value
    obj.extended?.apply(@)
    this
    
  @include: (obj) ->
    for key, value of obj when key not in Element.elementKeywords
      # Assign properties to the prototype
      @::[key] = value
    obj.included?.apply(@)
    this
    
  @property: (prop, desc) ->
    (new Property(prop, desc)).bind(@prototype)
    
  @properties: (properties) ->
    for prop, desc of properties
      @property prop, desc

if Spark?
  Spark.Element = Element
#--- Standalone ---
if module?
  module.exports = Element
else
  unless @Spark?
    @Spark = {}
  @Spark.Element = Element
#--- Standalone end ---
  