class EventBind
  constructor: (@event, @target, @callback) ->
    @binded = false
  bind: ->
    unless @binded 
      if typeof @target.addEventListener == 'function'
        @target.addEventListener(@event, @callback)
      else if typeof @target.addListener == 'function'
        @target.addListener(@event, @callback)
      else if typeof @target.on == 'function'
        @target.on(@event, @callback)
      else
        throw 'No function to add a event listener found'
    @binded = true
  unbind: ->
    if @binded 
      if typeof @target.removeEventListener == 'function'
        @target.removeEventListener(@event, @callback)
      else if typeof @target.removeListener == 'function'
        @target.removeListener(@event, @callback)
      else if typeof @target.off == 'function'
        @target.off(@event, @callback)
      else
        throw 'No function to remove a event listener found'
    @binded = false
  equals: (eventBind) -> 
    eventBind.event    == @event    and
    eventBind.target   == @target   and
    eventBind.callback == @callback
    
if Spark?
  Spark.EventBind = EventBind
#--- Standalone ---
if module?
  module.exports = EventBind
else
  unless @Spark?
    @Spark = {}
  @Spark.EventBind = EventBind
#--- Standalone end ---