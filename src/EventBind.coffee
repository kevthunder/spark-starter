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
        throw new Error('No function to add event listeners was found')
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
        throw new Error('No function to remove event listeners was found')
    @binded = false
  equals: (eventBind) -> 
    eventBind.event    == @event    and
    eventBind.target   == @target   and
    eventBind.callback == @callback
  match: (event, target) -> 
    event    == @event    and
    target   == @target
