class Updater
  constructor: () ->
    @callbacks = []
    @next = []
    @updating = false
  update: ->
    @updating = true
    @next = @callbacks.slice()
    while @callbacks.length > 0
      callback = @callbacks.shift()
      callback()
    @callbacks = @next
    @updating = false
    this
  addCallback: (callback)->
    unless @callbacks.includes(callback)
      @callbacks.push(callback)
    if @updating and !@next.includes(callback)
        @next.push(callback)
  nextTick: (callback)->
    if @updating
      unless @next.includes(callback)
        @next.push(callback)
    else
      @addCallback(callback)
  removeCallback: (callback)->
    index = @callbacks.indexOf(callback)
    if index != -1
      @callbacks.splice(index,1)
    index = @next.indexOf(callback)
    if index != -1
      @next.splice(index,1)
  getBinder: ->
    new Updater.Binder(this)
  destroy: ->
    @callbacks = []
    @next = []
  
class Updater.Binder
  constructor: (@target) ->
    @binded = false
  bind: ->
    if !@binded and @callback?
      @target.addCallback(@callback)
    @binded = true
  unbind: ->
    if @binded and @callback?
      @target.removeCallback(@callback)
    @binded = false
