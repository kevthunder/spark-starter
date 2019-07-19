module.exports = class PropertyOwner

  getProperty: (name)->
    @_properties && @_properties.find (prop)->
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
    
  listenerAdded: (event, listener)->
    @_properties.forEach (prop)=>
      if prop.getInstanceType()::changeEventName == event
        prop.getInstance(this).get()

  extended: (target)->
    target.listenerAdded = @listenerAdded
