#= require <EventBind>
#--- Standalone ---
EventBind = @Spark?.EventBind || require('./EventBind')
#--- Standalone end ---

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
      
  event: (event, target = this) ->
    unless @invalidationEvents.some( (eventBind)-> eventBind.event == event and eventBind.target == target)
      @invalidationEvents.push(
        pluck(@recycled, (eventBind)-> 
          eventBind.event == event and eventBind.target == target
        ) or
        new EventBind(event, target, @invalidateCallback)
      )  
  
  value: (val, event, target = this) ->
    @event(event, target)
    val
  
  prop: (prop, target = this) ->
    @value(target[prop], prop+'Changed', target)
    
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
    
    
if Spark?
  Spark.Invalidator = Invalidator
#--- Standalone ---
if module?
  module.exports = Invalidator
else
  unless @Spark?
    @Spark = {}
  @Spark.Invalidator = Invalidator
#--- Standalone end ---