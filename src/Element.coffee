Property = require('./Property')

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
    if obj.prototype?
      @include obj.prototype
    obj.extended?.apply(@)
    this
    
  @include: (obj) ->
    for key, value of obj when key not in Element.elementKeywords
      if key == '_properties'
        for property in value
          property.bind(@.prototype)
      else
        @::[key] = value
    obj.included?.apply(@)
    this
    
  @property: (prop, desc) ->
    (new Property(prop, desc)).bind(@prototype)
    
  @properties: (properties) ->
    for prop, desc of properties
      @property prop, desc
