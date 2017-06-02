#= require <PropertyInstance>
#--- Standalone ---
PropertyInstance = @Spark?.PropertyInstance or require('./PropertyInstance')
#--- Standalone end ---

class Property
  constructor: (@name, @options) ->
    calculated = false
    
  bind: (target) ->
    prop = this
    maj = @name.charAt(0).toUpperCase() + @name.slice(1)
    Object.defineProperty target, @name, {
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
    @checkFunctions(target)
    @checkAfterAddListener(target)
    
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
        @addListener.overrided(evt, listener)
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