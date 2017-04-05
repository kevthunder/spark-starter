
class Element
  @elementKeywords = ['extended', 'included']
  tap: (name) ->
    args = Array::slice.call(arguments)
    if typeof name == 'function'
      name.apply this, args.slice(1)
    else
      @[name].apply this, args.slice(1)
    this
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
      else if desc.init?
        @prototype['init'+maj] = desc.init
        @prototype['get'+maj] = ->
          unless this['_'+prop]?
            this['_'+prop] = this['init'+maj]()
          this['_'+prop]
      else
        @prototype['get'+maj] = ->
          this['_'+prop]
      desc.get = ->
        this['get'+maj]()
    unless desc.set? and desc.set == false
      if desc.set?
        @prototype['set'+maj] = desc.set
      else if desc.change?
        @prototype['change'+maj] = desc.change
        @prototype['set'+maj] = (val)->
          if this['_'+prop] != val
            old = this['_'+prop]
            this['_'+prop] = val
            this['change'+maj](old)
          return this
      else
        @prototype['set'+maj] = (val)->
          this['_'+prop] = val
          return this
      desc.set = (val) ->
        this['set'+maj](val)
    Object.defineProperty @prototype, prop, desc
  @properties: (properties) ->
    for prop, desc of properties
      @property prop, desc

if module?
  module.exports = Element
else 
  unless @Spark?
    @Spark = {}
  @Spark.Element = Element
  
  