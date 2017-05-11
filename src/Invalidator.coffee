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
  constructor: (@obj, @property) ->
    @invalidationEvents = []
    @recycled = []
    @invalidateCallback = => 
      @invalidate()
      null

  invalidate: ->
    functName = 'invalidate' + @property.charAt(0).toUpperCase() + @property.slice(1)
    if @obj[functName]?
      @obj[functName]()
    else
      @obj[@property] = null
      
  fromEvent: (event, target = this) ->
    unless @invalidationEvents.some( (eventBind)-> eventBind.event == event and eventBind.target == target)
      @invalidationEvents.push(
        pluck(@recycled, (eventBind)-> 
          eventBind.event == event and eventBind.target == target
        ) or
        new EventBind(event, target, @invalidateCallback)
      )  
  
  fromValue: (val, event, target = this) ->
    @fromEvent(event, target)
    val
  
  fromProperty: (propertyName, target = this) ->
    maj = propertyName.charAt(0).toUpperCase() + propertyName.slice(1)
    @fromValue(target[propertyName],'changed'+maj, target)
    
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