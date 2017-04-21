
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
    if @_callbacks[name]?
      @_callbacks[name]
    else
      @_callbacks[name] = (args...)=> this[name].call(this,args)
  
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
    maj = prop.charAt(0).toUpperCase() + prop.slice(1);
    if desc.default?
      @prototype['_'+prop] = desc.default
    else
      @prototype['_'+prop] = null
    unless desc.get? and desc.get == false
      if desc.get?
        @prototype['get'+maj] = desc.get
      else 
        if desc.init?
          @prototype['init'+maj] = desc.init
        @prototype['get'+maj] = ->
          if typeof this['init'+maj] == 'function' and !this['_'+prop]?
            this['_'+prop] = this['init'+maj]()
          this['_'+prop]
      desc.get = ->
        this['get'+maj]()
    unless desc.set? and desc.set == false
      if desc.set?
        @prototype['set'+maj] = desc.set
      else 
        if desc.change?
          @prototype['change'+maj] = desc.change
        @prototype['set'+maj] = (val)->
          if this['_'+prop] != val
            old = this['_'+prop]
            this['_'+prop] = val
            if typeof this['change'+maj] == 'function'
              this['change'+maj](old)
            if typeof @emitEvent == 'function'
              @emitEvent('changed'+maj, [old])
          return this
      desc.set = (val) ->
        this['set'+maj](val)
    Object.defineProperty @prototype, prop, desc
    
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
  