BasicProperty = require('./PropertyTypes/BasicProperty')
CollectionProperty = require('./PropertyTypes/CollectionProperty')
ComposedProperty = require('./PropertyTypes/ComposedProperty')
DynamicProperty = require('./PropertyTypes/DynamicProperty')
CalculatedProperty = require('./PropertyTypes/CalculatedProperty')
ActivableProperty = require('./PropertyTypes/ActivableProperty')
PropertyOwner = require('./PropertyOwner')
Mixable = require('./Mixable')

class Property
  @::composers = [ComposedProperty, CollectionProperty, DynamicProperty, BasicProperty, CalculatedProperty, ActivableProperty]

  constructor: (@name, @options = {}) ->
    
    
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
      @makeOwner(target)
    prop
    
  override: (parent) ->
    unless @options.parent?
      @options.parent = parent.options
      for key, value of parent.options
        if typeof @options[key] == 'function' and typeof value == 'function'
          @options[key].overrided = value
        else if typeof @options[key] == 'undefined'
          @options[key] = value
    
  makeOwner: (target) ->
    unless target.extensions?.includes(PropertyOwner.prototype)
      Mixable.Extension.make(PropertyOwner.prototype, target)
    
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
    if !@instanceType
      @composers.forEach (composer)=>
        composer.compose(this)
    @instanceType
