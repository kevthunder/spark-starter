EventBind = require('./EventBind')

pluck = (arr,fn) ->
  index = arr.findIndex(fn)
  if index > -1
    found = arr[index]
    arr.splice(index, 1)
    found
  else
    null

class Invalidator
  constructor: (@property, @obj = null) ->
    @invalidationEvents = []
    @recycled = []
    @unknowns = []
    @invalidateCallback = => 
      @invalidate()
      null

  invalidate: ->
    if typeof @property.invalidate == "function"
      @property.invalidate()
    else
      functName = 'invalidate' + @property.charAt(0).toUpperCase() + @property.slice(1)
      if typeof @obj[functName] == "function"
        @obj[functName]()
      else
        @obj[@property] = null

  unknown: ->
    if typeof @property.unknown == "function"
      @property.unknown()
    else
      @invalidate()
        
  addEventBind: (event, target, callback) ->
    unless @invalidationEvents.some( (eventBind)-> eventBind.match(event,target))
      @invalidationEvents.push(
        pluck(@recycled, (eventBind)-> 
          eventBind.match(event,target)
        ) or
        new EventBind(event, target, callback)
      )
      
  getUnknownCallback: (prop, target) ->
    => 
      unless @unknowns.some( (unknown)-> 
        unknown.prop == prop && unknown.target == target
      )
        @unknowns.push({"prop": prop, "target": target})
        @unknown()
      
  event: (event, target = @obj) ->
    @addEventBind(event, target, @invalidateCallback)
  
  value: (val, event, target = @obj) ->
    @event(event, target)
    val
  
  prop: (prop, target = @obj) ->
    if typeof prop != 'string'
      throw new Error('Property name must be a string')
    @addEventBind(prop+'Invalidated', target, @getUnknownCallback(prop,target))
    @value(target[prop], prop+'Updated', target)
    
  validateUnknowns: (prop, target = @obj) ->
    unknowns = @unknowns
    @unknowns = []
    unknowns.forEach (unknown)->
      unknown.target[unknown.prop]
    
  isEmpty: ->
    @invalidationEvents.length == 0
    
  bind: ->
    @invalidationEvents.forEach (eventBind)-> eventBind.bind()
    
  recycle: (callback)-> 
    @recycled = @invalidationEvents
    @invalidationEvents = []
    
    done = =>
      @recycled.forEach (eventBind)-> eventBind.unbind()
      @recycled = []
      
    if typeof callback == "function"
      if callback.length > 1
        callback(this, done)
      else
        res = callback(this)
        done()
        res
    else
      done
  
  unbind: ->
    @invalidationEvents.forEach (eventBind)-> eventBind.unbind()
