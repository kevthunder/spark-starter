Property = require('./Property')

class Element
  @elementKeywords = ['extended', 'included','constructor']
  
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
        this[name].apply(this,args)
        null

  @extend: (obj) ->
    for key, value of obj when key not in Element.elementKeywords
      @[key] = value
    if obj.prototype?
      @include obj.prototype
    obj.extended?.apply(@)
    this
  
  @getIncludableProperties: (obj) ->
    exclude = Element.elementKeywords
    if obj._properties?
      exclude = exclude.concat(obj._properties.map((prop)->prop.name))
      exclude.push("_properties")
    
    props = []
    loop
      props = props.concat(
        Object.getOwnPropertyNames(obj).filter (key)=>
          !@::hasOwnProperty(key) and key.substr(0,2) != "__" and key not in exclude and key not in props
      )
      unless (obj = Object.getPrototypeOf(obj)) and obj != Object and obj != Element.prototype
        break
    props
    
  @include: (obj) ->
    for key in @getIncludableProperties( obj )
      @::[key] = obj[key]
    if obj._properties?
      for property in obj._properties
          @property(property.name, Object.assign({},property.options))
    obj.included?.apply(@)
    this
    
  @property: (prop, desc) ->
    (new Property(prop, desc)).bind(@prototype)
    
  @properties: (properties) ->
    for prop, desc of properties
      @property prop, desc
