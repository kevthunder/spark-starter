Binder = require('./Binder')
EventBind = require('./EventBind')

pluck = (arr,fn) ->
  index = arr.findIndex(fn)
  if index > -1
    found = arr[index]
    arr.splice(index, 1)
    found
  else
    null

class Invalidator extends Binder
  @strict = true
  constructor: (@property, @obj = null) ->
    super()
    @invalidationEvents = []
    @recycled = []
    @unknowns = []
    @strict = @constructor.strict
    @invalidated = false
    @invalidateCallback = => 
      @invalidate()
      null

  invalidate: ->
    @invalidated = true
    if typeof @property == "function"
      @property()
    else if typeof @callback == "function"
      @callback()
    else if @property? and typeof @property.invalidate == "function"
      @property.invalidate()
    else if typeof @property == "string"
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
    @addBinder(new EventBind(event, target, callback))
        
  addBinder: (binder) ->
    unless binder.callback?
      binder.callback = @invalidateCallback
      binder.ref.callback = @invalidateCallback
    unless @invalidationEvents.some( (eventBind)-> eventBind.equals(binder))
      @invalidationEvents.push(
        pluck(@recycled, (eventBind)-> 
          eventBind.equals(binder)
        ) or
        binder
      )
      
  getUnknownCallback: (prop, target) ->
    callback = => 
      @addUnknown -> 
          target[prop]
        , prop, target
    callback.ref = {
      prop: prop
      target: target
    }
    callback

  addUnknown: (fn,prop,target) ->
    unless @findUnknown(prop,target)
      fn.ref = {"prop": prop, "target": target}
      @unknowns.push(fn)
      @unknown()

  findUnknown: (prop,target) ->
    if prop? or target?
      @unknowns.find (unknown)-> 
          unknown.ref.prop == prop && unknown.ref.target == target
      
  event: (event, target = @obj) ->
    if @checkEmitter(target)
      @addEventBind(event, target)
  
  value: (val, event, target = @obj) ->
    @event(event, target)
    val
  
  prop: (prop, target = @obj) ->
    if typeof prop != 'string'
      throw new Error('Property name must be a string')
    if @checkEmitter(target)
      @addEventBind(prop+'Invalidated', target, @getUnknownCallback(prop,target))
      @value(target[prop], prop+'Updated', target)
    else
      target[prop]

  propInitiated:  (prop, target = @obj) ->
    initiated = target.getPropertyInstance(prop).initiated
    if !initiated and @checkEmitter(target)
      @event(prop+'Updated', target)
    initiated

  funct: (funct)->
    invalidator = new Invalidator =>
      @addUnknown =>
          res2 = funct(invalidator)
          if res != res2
            @invalidate()
        , invalidator
    res = funct(invalidator)
    @invalidationEvents.push(invalidator)
    res

  validateUnknowns: (prop, target = @obj) ->
    unknowns = @unknowns
    @unknowns = []
    unknowns.forEach (unknown)->
      unknown()
    
  isEmpty: ->
    @invalidationEvents.length == 0
    
  bind: ->
    @invalidated = false
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

  checkEmitter: (emitter)->
    EventBind.checkEmitter(emitter,@strict)

  unbind: ->
    @invalidationEvents.forEach (eventBind)-> eventBind.unbind()
