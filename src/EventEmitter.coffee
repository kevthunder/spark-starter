class EventEmitter
  getAllEvents: () ->
    @._events || (@._events = {})

  getListeners: (e) ->
    events = @getAllEvents()
    events[e] || (events[e] = [])

  hasListener: (e, listener) ->
    @getListeners(e).includes(listener)

  addListener: (e, listener) ->
    unless @hasListener(e, listener)
      @getListeners(e).push(listener)
      @listenerAdded(e, listener)

  listenerAdded: (e, listener) ->

  removeListener: (e, listener) ->
    listeners = @getListeners(e)
    index = listeners.indexOf(listener)
    if index != -1
      listeners.splice(index, 1)
      @listenerRemoved(e, listener)

  listenerRemoved: (e, listener) ->

  emitEvent: (e, args...) ->
    listeners = @getListeners(e)
    listeners.forEach (listener)->
      listener(args...)

  @::emit = @::emitEvent
  @::trigger = @::emitEvent
  @::on = @::addListener
  @::off = @::removeListener