PropertyInstance = require('./PropertyInstance')
CollectionProperty = require('./CollectionProperty')
ComposedProperty = require('./ComposedProperty')

class Property
  constructor: (@name, @options = {}) ->
    calculated = false
    
  bind: (target) ->
    prop = this
    unless typeof target.getProperty == 'function' and target.getProperty(@name) == this
      if typeof target.getProperty == 'function' and (parent = target.getProperty(@name))?
        @override(parent)
      @getInstanceType().bind(target,prop)
      target._properties = (target._properties || []).concat([prop])
      if parent?
        target._properties = target._properties.filter (existing)->
          existing != parent
      @checkFunctions(target)
      @checkAfterAddListener(target)
    prop
    
  override: (parent) ->
    unless @options.parent?
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
    if typeof target.addListener == 'function' and typeof target.afterAddListener == 'undefined' and typeof target.addListener.overrided == 'undefined'
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
      Type = @getInstanceType()
      obj[varName] = new Type(this,obj)
    obj[varName]

  getInstanceType: () ->
    if @options.composed?
      return ComposedProperty
    if @options.collection?
      return CollectionProperty
    return PropertyInstance
    
  getChangeEventName: ()->
    @options.changeEventName ||
      @name+'Changed'
      
  getUpdateEventName: ()->
    @options.changeEventName ||
      @name+'Updated'
      
  getInvalidateEventName: ()->
    @options.changeEventName ||
      @name+'Invalidated'
      
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

    getManualDataProperties: ->
      @_properties.reduce (res,prop)=>
        if prop.isInstantiated(this)
          instance = prop.getInstance(this)
          if instance.calculated && instance.manual
            res[prop.name] = instance.value
        res
      , {}

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
