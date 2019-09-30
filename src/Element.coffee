PropertiesManager = require('spark-properties').PropertiesManager
Mixable = require('./Mixable')

module.exports = class Element extends Mixable
  constructor: (data)->
    super()
    @initPropertiesManager(data)
    @init()
  initPropertiesManager: (data)->
    @propertiesManager = @propertiesManager.useScope(this)
    @propertiesManager.initProperties()
    @propertiesManager.createScopeGetterSetters()
    if typeof data == "object"
      @propertiesManager.setPropertiesData(data)
    @propertiesManager.initWatchers()
    this
  init: ->
    this
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
    unless @_callbacks[name]?
      @_callbacks[name] = (args...)=> 
        this[name].apply(this,args)
        null
      @_callbacks[name].owner = this
    @_callbacks[name]

  destroy: ->
    this.propertiesManager.destroy()

  getFinalProperties: ->
    ['propertiesManager']

  extended: (target)->
    if target.propertiesManager
      target.propertiesManager = target.propertiesManager.copyWith(@propertiesManager.propertiesOptions)
    else
      target.propertiesManager = @propertiesManager

  propertiesManager: new PropertiesManager()

  @property: (prop, desc) ->
    @::propertiesManager = @::propertiesManager.withProperty(prop, desc)
    
  @properties: (properties) ->
    @::propertiesManager = @::propertiesManager.copyWith(properties)


