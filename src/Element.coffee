Property = require('./Property')
Mixable = require('./Mixable')

module.exports = class Element extends Mixable
  constructor: ->
    super()
    @init()
  init: ->
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

  getFinalProperties: ->
    if @._properties?
      ['_properties'].concat @._properties.map((prop)->prop.name)
    else
      []

  extended: (target)->
    if @._properties?
      for property in @._properties
        options = Object.assign({},property.options)
        (new Property(property.name, options)).bind(target)

  @property: (prop, desc) ->
    (new Property(prop, desc)).bind(@prototype)
    
  @properties: (properties) ->
    for prop, desc of properties
      @property prop, desc

