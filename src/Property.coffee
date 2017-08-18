#= require <PropertyInstance>
#--- Standalone ---
PropertyInstance = @Spark?.PropertyInstance or require('./PropertyInstance')
#--- Standalone end ---

class Property
  constructor: (@name, @options = {}) ->
    calculated = false
    
  bind: (target) ->
    prop = this
    if typeof target.getProperty == 'function' and (parent = target.getProperty(@name))?
      @override(parent)
    maj = @name.charAt(0).toUpperCase() + @name.slice(1)
    Object.defineProperty target, @name, {
      configurable: true
      get: ->
        prop.getInstance(this).get()
      set: (val)->
        prop.getInstance(this).set(val)
    }
    target['get'+maj] = ->
        prop.getInstance(this).get()
    target['set'+maj] = (val)->
        prop.getInstance(this).set(val)
        this
    target['invalidate'+maj] = ->
        prop.getInstance(this).invalidate()
        this
    target._properties = (target._properties || []).concat([prop])
    if parent?
      target._properties = target._properties.filter (existing)->
        existing != parent
    @checkFunctions(target)
    @checkAfterAddListener(target)
    prop
    
  override: (parent) ->
    @options.parent = parent.options
    for key, value of parent.options
      if typeof @options[key] == 'function' and typeof value == 'function'
        @options[key].overrided = value
      else if typeof @options[key] == 'undefined'
        @options[key] = value
    
  checkFunctions: (target) ->
    @checkAfterAddListener(target)
    for name, funct of Property.fn
      if typeof target[name] == 'undefined'
        target[name] = funct
      
  checkAfterAddListener: (target) ->
    if typeof target.addListener == 'function' and typeof target.afterAddListener == 'undefined'
      target.afterAddListener = Property.optionalFn.afterAddListener
      overrided = target.addListener
      target.addListener = (evt, listener)-> 
        @addListener.overrided.call(this, evt, listener)
        @afterAddListener(evt)
      target.addListener.overrided = overrided
    
  getInstanceVarName: ->
    @options.instanceVarName ||
      '_'+@name
    
  isInstantiated: (obj) ->
    obj[@getInstanceVarName()]?
  
  getInstance: (obj) ->
    varName = @getInstanceVarName()
    unless @isInstantiated(obj)
      obj[varName] = new PropertyInstance(this,obj)
    obj[varName]
    
  getChangeEventName: ()->
    @options.changeEventName ||
      @name+'Changed'
      
  @fn:
    getProperty: (name)->
      @_properties.find (prop)->
        prop.name == name
        
    getPropertyInstance: (name)->
      res = @getProperty(name)
      if res
        res.getInstance(this)
        
    getProperties: ->
      @_properties.slice()
      
    getPropertyInstances: ()->
      @_properties.map (prop)=>
        prop.getInstance(this)
        
    getInstantiatedProperties: ->
      @_properties.filter (prop)=>
        prop.isInstantiated(this)
      .map (prop)=>
        prop.getInstance(this)

    setProperties: (data, options = {})->
      for key,val of data
        if (!options.whitelist? or options.whitelist.indexOf(key) != -1) and (!options.blacklist? or options.blacklist.indexOf(key) == -1)
          prop = @getPropertyInstance(key)
          if prop?
            prop.set(val)
      this
        
    destroyProperties: ->
      @getInstantiatedProperties().forEach (prop)=>
        prop.destroy()
      @_properties = []
      true
      
  @optionalFn:
    afterAddListener: (event)->
      @_properties.forEach (prop)=>
        if prop.getChangeEventName() == event
          prop.getInstance(this).get()
          
          
if Spark?
  Spark.Property = Property
#--- Standalone ---
if module?
  module.exports = Property
else
  unless @Spark?
    @Spark = {}
  @Spark.Property = Property
#--- Standalone end ---