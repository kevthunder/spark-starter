Binder = require('./Binder')

class EventBind extends Binder
  constructor: (@event, @target, @callback) ->
    super()
    @ref = {event:@event, target:@target, callback:@callback}
  doBind: ->
    if typeof @target.addEventListener == 'function'
      @target.addEventListener(@event, @callback)
    else if typeof @target.addListener == 'function'
      @target.addListener(@event, @callback)
    else if typeof @target.on == 'function'
      @target.on(@event, @callback)
    else
      throw new Error('No function to add event listeners was found')
  doUnbind: ->
    if typeof @target.removeEventListener == 'function'
      @target.removeEventListener(@event, @callback)
    else if typeof @target.removeListener == 'function'
      @target.removeListener(@event, @callback)
    else if typeof @target.off == 'function'
      @target.off(@event, @callback)
    else
      throw new Error('No function to remove event listeners was found')

  equals: (eventBind) -> 
    super(eventBind) and eventBind.event == @event

  match: (event, target) -> 
    event    == @event    and
    target   == @target

  @checkEmitter = (emitter,fatal=true)->
      if typeof emitter.addEventListener == 'function' or typeof emitter.addListener == 'function' or typeof emitter.on == 'function'
        true
      else if fatal
        throw new Error('No function to add event listeners was found')
      else 
        false
