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
  constructor: (@invalidated, @scope = null) ->
    super()
    @invalidationEvents = []
    @recycled = []
    @unknowns = []
    @strict = @constructor.strict
    @invalid = false
    @invalidateCallback = => 
      @invalidate()
      null
    @invalidateCallback.owner = this

  invalidate: ->
    @invalid = true
    if typeof @invalidated == "function"
      @invalidated()
    else if typeof @callback == "function"
      @callback()
    else if @invalidated? and typeof @invalidated.invalidate == "function"
      @invalidated.invalidate()
    else if typeof @invalidated == "string"
      functName = 'invalidate' + @invalidated.charAt(0).toUpperCase() + @invalidated.slice(1)
      if typeof @scope[functName] == "function"
        @scope[functName]()
      else
        @scope[@invalidated] = null

  unknown: ->
    if typeof @invalidated?.unknown == "function"
      @invalidated.unknown()
    else
      @invalidate()
        
  addEventBind: (event, target, callback) ->
    @addBinder(new EventBind(event, target, callback))
        
  addBinder: (binder) ->
    unless binder.callback?
      binder.callback = @invalidateCallback
    unless @invalidationEvents.some( (eventBind)-> eventBind.equals(binder))
      @invalidationEvents.push(
        pluck(@recycled, (eventBind)-> 
          eventBind.equals(binder)
        ) or
        binder
      )
      
  getUnknownCallback: (prop) ->
    callback = => 
      @addUnknown -> 
          prop.get()
        , prop
    callback.ref = {
      prop: prop
    }
    callback

  addUnknown: (fn,prop) ->
    unless @findUnknown(prop)
      fn.ref = {"prop": prop}
      @unknowns.push(fn)
      @unknown()

  findUnknown: (prop) ->
    if prop? or target?
      @unknowns.find (unknown)-> 
          unknown.ref.prop == prop
      
  event: (event, target = @scope) ->
    if @checkEmitter(target)
      @addEventBind(event, target)
  
  value: (val, event, target = @scope) ->
    @event(event, target)
    val
  
  prop: (prop, target = @scope) ->
    if typeof prop == 'string'
      if target.getPropertyInstance? and propInstance = target.getPropertyInstance(prop)
        prop = propInstance
      else
        return target[prop] 
    else if !@checkPropInstance(prop)
      throw new Error('Property must be a PropertyInstance or a string')

    @addEventBind('invalidated', prop, @getUnknownCallback(prop))
    @value(prop.get(), 'updated', prop)

  propPath: (path, target = @scope) ->
    path = path.split('.')
    val = target
    while val? and path.length > 0
      prop = path.shift()
      val = @prop(prop, val)
    val

  propInitiated:  (prop, target = @scope) ->
    if typeof prop == 'string' and target.getPropertyInstance?
        prop = target.getPropertyInstance(prop)
    else if !@checkPropInstance(prop)
      throw new Error('Property must be a PropertyInstance or a string')

    initiated = prop.initiated
    if !initiated
      @event('updated', prop)
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

  validateUnknowns: ->
    unknowns = @unknowns
    @unknowns = []
    unknowns.forEach (unknown)->
      unknown()
    
  isEmpty: ->
    @invalidationEvents.length == 0
    
  bind: ->
    @invalid = false
    @invalidationEvents.forEach (eventBind)-> eventBind.bind()
    
  recycle: (callback)-> 
    @recycled = @invalidationEvents
    @invalidationEvents = []
    
    done = @endRecycle.bind(this)
      
    if typeof callback == "function"
      if callback.length > 1
        callback(this, done)
      else
        res = callback(this)
        done()
        res
    else
      done

  endRecycle: ->
    @recycled.forEach (eventBind)-> eventBind.unbind()
    @recycled = []

  checkEmitter: (emitter)->
    EventBind.checkEmitter(emitter,@strict)

  checkPropInstance: (prop)->
    typeof prop.get == "function" && @checkEmitter(prop)

  unbind: ->
    @invalidationEvents.forEach (eventBind)-> eventBind.unbind()
