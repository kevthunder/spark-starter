#--- Standalone ---
Invalidator = @Spark?.Invalidator || require('./Invalidator')
#--- Standalone end ---

afterAddListener = (event)->
  if match = event.match(/^changed(\w*)$/)
    maj = match[1]
    prop = maj.charAt(0).toLowerCase() + maj.slice(1)
    if typeof this['invalidate'+maj] == 'function' and this[prop+'Calculated'] == false
      this['get'+maj]()

registerCalculatedProperty = (obj, prop, calcul)->
  maj = prop.charAt(0).toUpperCase() + prop.slice(1)
  if calcul?
    obj['calcul'+maj] = desc.calcul
  if obj['calcul'+maj]?
    obj[prop+'Calculated'] = false
    obj['invalidate'+maj] = ->
      this[prop+'Calculated'] = false
      if this['immediate'+maj] or (typeof @getListeners == 'function' and @getListeners('changed'+maj).length > 0)
        this['get'+maj]()
      else
        this[prop+'Invalidator'].unbind()
    if typeof @addListener == 'function' and typeof @afterAddListener != 'function' 
      @afterAddListener = afterAddListener
      overrided = @addListener
      @addListener = (evt, listener)-> 
        overrided(evt, listener)
        @afterAddListener(evt)

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
    maj = prop.charAt(0).toUpperCase() + prop.slice(1)
    if desc.default?
      @prototype['_'+prop] = desc.default
    else
      @prototype['_'+prop] = null
    unless desc.get? and desc.get == false
      if desc.get?
        @prototype['get'+maj] = desc.get
      else 
        registerCalculatedProperty(@prototype, prop, desc.calcul)
        @prototype['get'+maj] = ->
          if typeof this['calcul'+maj] == 'function' and !this[prop+'Calculated']
            unless this[prop+'Invalidator']?
              this[prop+'Invalidator'] = new Invalidator(this,prop)
            this[prop+'Invalidator'].recycle (invalidator)=> 
              this['_'+prop] = this['calcul'+maj](invalidator)
              invalidator.bind()
            this[prop+'Calculated'] = true
          this['_'+prop]
      desc.get = ->
        this['get'+maj]()
    unless desc.set? and desc.set == false
      if desc.set?
        @prototype['set'+maj] = desc.set
      else 
        if desc.change?
          @prototype['change'+maj] = desc.change
        if desc.ingest?
          @prototype['ingest'+maj] = desc.ingest
        @prototype['set'+maj] = (val)->
          if typeof this['ingest'+maj] == 'function'
            val = this['ingest'+maj](val)
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
  