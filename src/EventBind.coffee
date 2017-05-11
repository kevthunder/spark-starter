class EventBind
  constructor: (@event, @target, @callback) ->
    @binded = false
  bind: ->
    unless @binded 
      @target.addListener(@event, @callback)
    @binded = true
  unbind: ->
    if @binded 
      @target.removeListener(@event, @callback)
    @binded = false
  equals: (eventBind) -> 
    eventBind.event    == @event    and
    eventBind.target   == @target   and
    eventBind.callback == @callback